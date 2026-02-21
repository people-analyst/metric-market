import express, { type Request, Response, NextFunction } from "express";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedBundles } from "./seedBundles";
import { seedPerformanceMetrics } from "./seedMetrics";
import { recordRequest, startMetricsPush } from "./hubMetrics";
import { startAutoSync, startupPull } from "./githubSync";
import { handleDirective } from "./directiveHandler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const _require = createRequire(import.meta.url);
const hubSdk = _require("../hub-sdk.cjs");
hubSdk.init(app, {
  pollDirectives: true,
  pollIntervalMs: 300000,
  onDirective: handleDirective,
});

try {
  const embeddedAiSdk = _require("../embedded-ai-sdk.cjs");
  embeddedAiSdk.mount(app);
} catch (e) {
  log(`Embedded AI SDK not loaded: ${(e as Error).message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      recordRequest(duration, res.statusCode >= 400);
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await seedBundles();
  } catch (e) {
    log(`seedBundles failed (non-fatal): ${(e as Error).message}`);
  }

  try {
    await seedPerformanceMetrics();
  } catch (e) {
    log(`seedPerformanceMetrics failed (non-fatal): ${(e as Error).message}`);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // guard: if an /api/* or /health request reaches here, it was not handled
  // by any registered route — return 404 JSON instead of falling through
  // to the static file catch-all
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", app: "metric-market", sdkVersion: "2.3.0", timestamp: new Date().toISOString() });
  });
  app.use("/api/*", (_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", app: "metric-market", fallback: true });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    startMetricsPush(300000);
    startAutoSync();
    startupPull();
  });
})();
