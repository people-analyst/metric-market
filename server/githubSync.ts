import { createRequire } from "module";
import { execSync } from "child_process";

const REPO_OWNER = "people-analyst";
const REPO_NAME = "metric-market";
const APP_SLUG = process.env.APP_SLUG || "metric-market";
const WORKSPACE = process.cwd();
const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const GIT_OPTS = { cwd: WORKSPACE, timeout: 30000, encoding: "utf-8" as const };
const GIT_OPTS_SHORT = { cwd: WORKSPACE, timeout: 10000, encoding: "utf-8" as const };

let _syncTimer: ReturnType<typeof setInterval> | null = null;
let _lastPushTime: number | null = null;
let _lastPullTime: number | null = null;
let _lastPushSha: string | null = null;
let _lastPullSha: string | null = null;
let _pushCount = 0;
let _pullCount = 0;
let _isSyncing = false;
let _lastError: string | null = null;
let _consecutiveFailures = 0;

let _connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (
    _connectionSettings &&
    _connectionSettings.settings?.expires_at &&
    new Date(_connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return _connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) throw new Error("X_REPLIT_TOKEN not found — GitHub connector unavailable");

  _connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=github",
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    _connectionSettings?.settings?.access_token ||
    _connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!_connectionSettings || !accessToken) throw new Error("GitHub not connected");
  return accessToken;
}

async function ensureGitHubRemote(): Promise<void> {
  const token = await getAccessToken();
  const remoteUrl = `https://x-access-token:${token}@github.com/${REPO_OWNER}/${REPO_NAME}.git`;

  try {
    execSync('git config user.email "metric-market@people-analyst.dev"', GIT_OPTS_SHORT);
    execSync('git config user.name "Metric Market Sync"', GIT_OPTS_SHORT);
  } catch {}

  try {
    const currentUrl = execSync("git remote get-url github 2>/dev/null || echo ''", GIT_OPTS_SHORT).trim();
    if (currentUrl && currentUrl.includes(`github.com/${REPO_OWNER}/${REPO_NAME}`)) {
      execSync(`git remote set-url github "${remoteUrl}"`, GIT_OPTS_SHORT);
    } else {
      if (currentUrl) execSync("git remote remove github", GIT_OPTS_SHORT);
      execSync(`git remote add github "${remoteUrl}"`, GIT_OPTS_SHORT);
    }
  } catch {
    try { execSync("git remote remove github 2>/dev/null || true", GIT_OPTS_SHORT); } catch {}
    execSync(`git remote add github "${remoteUrl}"`, GIT_OPTS_SHORT);
  }
}

// ── IDE Detection ────────────────────────────────────────────────────

export function detectIDE(): string {
  if (process.env.REPL_SLUG || process.env.REPL_ID) return "replit";
  if (process.env.CURSOR_TRACE_ID || process.env.CURSOR_SESSION) return "cursor";
  if (process.env.WINDSURF_SESSION) return "windsurf";
  if (process.env.CODESPACES) return "codespaces";
  if (process.env.GITPOD_WORKSPACE_ID) return "gitpod";
  if (process.env.KANBAI_AGENT_ID || process.env.KANBAI_TASK_ID) return "claude-agent";
  if (process.env.IDE_SOURCE) return process.env.IDE_SOURCE;
  return "unknown";
}

// ── Auth Helper (shared by routes) ───────────────────────────────────

export function authorizeGitHubSync(req: any, res: any): boolean {
  const authHeader = req.headers.authorization || "";
  const origin = req.headers.origin || req.headers.referer || "";
  const host = req.headers.host || "";
  const isSameOrigin = origin.includes(host) || !origin || req.headers.referer?.includes(host);

  if (!isSameOrigin) {
    const expectedKey = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY || "";
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
    if (!expectedKey) {
      res.status(401).json({ error: "Unauthorized — no deploy secret configured" });
      return false;
    }
  }
  return true;
}

// ── Pull from GitHub (git CLI with stash safety) ─────────────────────

export async function pullFromGitHub(options?: {
  branch?: string;
  source?: string;
  trigger?: string;
}): Promise<{
  success: boolean;
  branch?: string;
  output?: string;
  stashed?: boolean;
  stashConflict?: boolean;
  source?: string;
  trigger?: string;
  pulledAt?: string;
  sha?: string;
  error?: string;
}> {
  if (_isSyncing) return { success: false, error: "Sync already in progress" };
  _isSyncing = true;

  try {
    await ensureGitHubRemote();

    const branch = options?.branch || process.env.GIT_BRANCH || "main";

    const status = execSync("git status --porcelain", GIT_OPTS_SHORT).trim();

    let stashed = false;
    if (status) {
      console.log("[github-sync] Stashing uncommitted changes before pull...");
      execSync("git stash push -m 'auto-stash before hub pull'", GIT_OPTS_SHORT);
      stashed = true;
    }

    let output: string;
    try {
      output = execSync(`git pull github ${branch} --no-rebase --allow-unrelated-histories`, GIT_OPTS).trim();
    } catch (pullErr: any) {
      if (stashed) {
        try { execSync("git stash pop", GIT_OPTS_SHORT); } catch {}
      }
      throw pullErr;
    }

    let stashConflict = false;
    if (stashed) {
      try {
        execSync("git stash pop", GIT_OPTS_SHORT);
        console.log("[github-sync] Restored stashed changes");
      } catch {
        stashConflict = true;
        console.warn("[github-sync] Stash pop conflict — changes remain in stash. Run 'git stash show' to inspect.");
      }
    }

    let sha: string | undefined;
    try { sha = execSync("git rev-parse HEAD", GIT_OPTS_SHORT).trim(); } catch {}

    _lastPullTime = Date.now();
    _lastPullSha = sha || null;
    _pullCount++;
    _lastError = null;
    _consecutiveFailures = 0;

    console.log(`[github-sync] Pull from ${branch} completed:`, output);
    return {
      success: true,
      branch,
      output,
      stashed,
      stashConflict,
      source: options?.source || "startup",
      trigger: options?.trigger || "auto",
      pulledAt: new Date().toISOString(),
      sha,
    };
  } catch (err: any) {
    const errorMsg = err.stderr || err.message || String(err);
    _lastError = errorMsg;
    _consecutiveFailures++;
    console.error("[github-sync] Pull failed:", errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    _isSyncing = false;
  }
}

// ── Push to GitHub (git CLI with IDE tracking + Hub notification) ─────

export async function pushToGitHub(options?: {
  branch?: string;
  ide?: string;
  message?: string;
}): Promise<{
  success: boolean;
  pushed?: boolean;
  branch?: string;
  ide?: string;
  message?: string;
  commitSha?: string | null;
  filesChanged?: string[];
  pushedAt?: string;
  error?: string;
}> {
  if (_isSyncing) return { success: false, error: "Sync already in progress" };
  _isSyncing = true;

  try {
    await ensureGitHubRemote();

    const branch = options?.branch || process.env.GIT_BRANCH || "main";
    const ide = options?.ide || detectIDE();
    const message = options?.message || `[${ide}] auto-sync: ${new Date().toISOString()}`;

    execSync("git add -A", GIT_OPTS_SHORT);

    const status = execSync("git status --porcelain", GIT_OPTS_SHORT).trim();
    if (!status) {
      return { success: true, pushed: false, message: "No changes to push" };
    }

    const filesChanged = status.split("\n").map((l: string) => {
      const parts = l.trim().split(/\s+/);
      return parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
    });

    const escapedMsg = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${escapedMsg}"`, { ...GIT_OPTS_SHORT, timeout: 15000 });

    execSync(`git push github ${branch}`, GIT_OPTS);

    let commitSha: string | null = null;
    try { commitSha = execSync("git rev-parse HEAD", GIT_OPTS_SHORT).trim(); } catch {}

    const hubUrl = process.env.HUB_URL || "https://pa-toolbox.replit.app";
    fetch(`${hubUrl}/api/github/sync-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceApp: APP_SLUG,
        targetRepo: APP_SLUG,
        eventType: "code_push",
        action: "push",
        commitSha,
        filesChanged,
        details: { ide, branch, filesCount: filesChanged.length },
      }),
    }).catch(() => {});

    _lastPushTime = Date.now();
    _lastPushSha = commitSha;
    _pushCount++;
    _lastError = null;
    _consecutiveFailures = 0;

    console.log(`[github-sync] Push to ${branch} completed via ${ide}: ${filesChanged.length} files`);
    return {
      success: true,
      pushed: true,
      branch,
      ide,
      message,
      commitSha,
      filesChanged,
      pushedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    const errorMsg = err.stderr || err.message || String(err);
    _lastError = errorMsg;
    _consecutiveFailures++;
    console.error("[github-sync] Push failed:", errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    _isSyncing = false;
  }
}

// ── Git Status ───────────────────────────────────────────────────────

export function getGitStatus(): {
  branch: string;
  uncommittedChanges: number;
  uncommittedFiles: string[];
  lastCommit: { sha: string; message: string; date: string };
  stashedChanges: number;
  ide: string;
} {
  const branch = execSync("git branch --show-current", GIT_OPTS_SHORT).trim() || "main";
  const status = execSync("git status --porcelain", GIT_OPTS_SHORT).trim();
  const lastCommitRaw = execSync("git log -1 --format='%H|%s|%ai'", GIT_OPTS_SHORT).trim();
  const [sha = "", msg = "", date = ""] = lastCommitRaw.split("|");
  const stashList = execSync("git stash list 2>/dev/null || echo ''", GIT_OPTS_SHORT).trim();

  return {
    branch,
    uncommittedChanges: status ? status.split("\n").length : 0,
    uncommittedFiles: status ? status.split("\n").map((l: string) => l.trim()) : [],
    lastCommit: { sha: sha.replace(/'/g, ""), message: msg, date },
    stashedChanges: stashList ? stashList.split("\n").filter((l: string) => l.length > 0).length : 0,
    ide: detectIDE(),
  };
}

// ── Sync Status (combined) ───────────────────────────────────────────

export function getSyncStatus() {
  const gitStatus = getGitStatus();
  return {
    repo: `${REPO_OWNER}/${REPO_NAME}`,
    repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    appSlug: APP_SLUG,
    ide: gitStatus.ide,
    autoSyncEnabled: !!_syncTimer,
    autoSyncIntervalSeconds: SYNC_INTERVAL_MS / 1000,
    isSyncing: _isSyncing,
    lastPushTime: _lastPushTime ? new Date(_lastPushTime).toISOString() : null,
    lastPushSha: _lastPushSha,
    totalPushes: _pushCount,
    lastPullTime: _lastPullTime ? new Date(_lastPullTime).toISOString() : null,
    lastPullSha: _lastPullSha,
    totalPulls: _pullCount,
    lastError: _lastError,
    consecutiveFailures: _consecutiveFailures,
    git: gitStatus,
  };
}

// ── Auto-Sync (periodic push of new commits) ────────────────────────

async function autoSync() {
  if (_consecutiveFailures >= 3) {
    const backoffMinutes = Math.min(2 ** _consecutiveFailures, 60);
    if (_lastPushTime && (Date.now() - _lastPushTime) / 60000 < backoffMinutes) return;
  }

  try {
    const status = execSync("git status --porcelain", GIT_OPTS_SHORT).trim();
    if (!status) return;
    console.log(`[github-sync] Auto-sync: ${status.split("\n").length} uncommitted changes, pushing...`);
    await pushToGitHub();
  } catch (err: any) {
    console.error("[github-sync] Auto-sync error:", err.message);
  }
}

export function startAutoSync() {
  if (_syncTimer) return;
  console.log(`[github-sync] Auto-sync enabled (every ${SYNC_INTERVAL_MS / 1000}s) → ${REPO_OWNER}/${REPO_NAME}`);
  _syncTimer = setInterval(() => {
    autoSync().catch((err) => console.error("[github-sync] Auto-sync error:", err.message));
  }, SYNC_INTERVAL_MS);
}

export function stopAutoSync() {
  if (_syncTimer) {
    clearInterval(_syncTimer);
    _syncTimer = null;
    console.log("[github-sync] Auto-sync disabled");
  }
}

// ── Startup Auto-Pull ────────────────────────────────────────────────

export async function startupPull(): Promise<void> {
  try {
    const result = await pullFromGitHub({ source: "startup", trigger: "auto" });
    if (result.success) {
      if (result.output?.includes("Already up to date")) {
        console.log("[github-sync] Startup: Already up to date");
      } else {
        console.log(`[github-sync] Startup: Pulled latest changes (${result.sha?.substring(0, 7)})`);
        if (result.stashed) console.log("[github-sync] Startup: Had uncommitted changes — stashed and restored");
        if (result.stashConflict) console.warn("[github-sync] Startup: Stash pop had conflicts — inspect with 'git stash show'");
      }
    } else {
      console.warn("[github-sync] Startup auto-pull failed (non-fatal):", result.error);
    }
  } catch (err: any) {
    console.warn("[github-sync] Startup auto-pull failed (non-fatal):", err.message);
  }
}
