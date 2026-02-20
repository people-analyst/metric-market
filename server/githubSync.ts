import { createRequire } from "module";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const _require = createRequire(import.meta.url);
const { Octokit } = _require("@octokit/rest");

const REPO_OWNER = "people-analyst";
const REPO_NAME = "metric-market";
const WORKSPACE = "/home/runner/workspace";
const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const BLOB_BATCH_SIZE = 20;

let _lastSyncCommit: string | null = null;
let _syncTimer: ReturnType<typeof setInterval> | null = null;
let _isSyncing = false;
let _lastSyncTime: number | null = null;
let _lastSyncError: string | null = null;
let _lastAttemptTime: number | null = null;
let _syncCount = 0;
let _consecutiveFailures = 0;

let _connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (
    _connectionSettings &&
    _connectionSettings.settings.expires_at &&
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

  if (!xReplitToken) throw new Error("X_REPLIT_TOKEN not found");

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

async function getOctokit() {
  const token = await getAccessToken();
  return new Octokit({ auth: token });
}

function getCurrentCommitSha(): string {
  return execSync("git rev-parse HEAD", { cwd: WORKSPACE, encoding: "utf-8" }).trim();
}

function getCommitMessage(sha: string): string {
  return execSync(`git log -1 --format=%B ${sha}`, { cwd: WORKSPACE, encoding: "utf-8" }).trim();
}

function getTrackedFiles(): string[] {
  const output = execSync("git ls-files --cached", { cwd: WORKSPACE, encoding: "utf-8" });
  return output.trim().split("\n").filter((f) => f.length > 0);
}

function isTextFile(filePath: string): boolean {
  const binaryExts = new Set([
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2",
    ".ttf", ".eot", ".mp3", ".mp4", ".webm", ".zip", ".tar", ".gz", ".pdf",
  ]);
  return !binaryExts.has(path.extname(filePath).toLowerCase());
}

async function createBlobForFile(
  octokit: any,
  filePath: string,
): Promise<{ path: string; sha: string; mode: string } | null> {
  const fullPath = path.join(WORKSPACE, filePath);
  if (!fs.existsSync(fullPath)) return null;
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) return null;

  const encoding = isTextFile(filePath) ? "utf-8" : "base64";
  const content = isTextFile(filePath)
    ? fs.readFileSync(fullPath, "utf-8")
    : fs.readFileSync(fullPath).toString("base64");

  const { data } = await octokit.rest.git.createBlob({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    content,
    encoding,
  });

  return {
    path: filePath,
    sha: data.sha,
    mode: stat.mode & 0o111 ? "100755" : "100644",
  };
}

async function processBatch(octokit: any, files: string[]): Promise<{ path: string; sha: string; mode: string }[]> {
  const results = await Promise.all(
    files.map((f) => createBlobForFile(octokit, f).catch(() => null)),
  );
  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

async function pushToGitHub(
  commitMessage?: string,
): Promise<{ success: boolean; sha?: string; error?: string; filesCount?: number }> {
  if (_isSyncing) return { success: false, error: "Sync already in progress" };
  _isSyncing = true;

  try {
    const octokit = await getOctokit();
    const localSha = getCurrentCommitSha();
    const msg = commitMessage || getCommitMessage(localSha) || "Sync from Replit";
    const files = getTrackedFiles();

    console.log(`[github-sync] Pushing ${files.length} files to ${REPO_OWNER}/${REPO_NAME}...`);

    const allBlobs: { path: string; sha: string; mode: string }[] = [];
    for (let i = 0; i < files.length; i += BLOB_BATCH_SIZE) {
      const batch = files.slice(i, i + BLOB_BATCH_SIZE);
      const batchResults = await processBatch(octokit, batch);
      allBlobs.push(...batchResults);
      if (i + BLOB_BATCH_SIZE < files.length) {
        console.log(`[github-sync]   ${allBlobs.length}/${files.length} blobs...`);
      }
    }

    console.log(`[github-sync] Created ${allBlobs.length} blobs, building tree...`);

    const { data: tree } = await octokit.rest.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree: allBlobs.map((b) => ({
        path: b.path,
        mode: b.mode as "100644" | "100755",
        type: "blob" as const,
        sha: b.sha,
      })),
    });

    let parentSha: string | undefined;
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: "heads/main",
      });
      parentSha = ref.object.sha;
    } catch (e: any) {
      if (e.status !== 404 && e.status !== 409) throw e;
    }

    const commitParams: any = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: msg,
      tree: tree.sha,
    };
    if (parentSha) commitParams.parents = [parentSha];

    const { data: commit } = await octokit.rest.git.createCommit(commitParams);

    try {
      await octokit.rest.git.updateRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    } catch (e: any) {
      if (e.status === 422 || e.status === 404) {
        await octokit.rest.git.createRef({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          ref: "refs/heads/main",
          sha: commit.sha,
        });
      } else {
        throw e;
      }
    }

    _lastSyncCommit = localSha;
    _lastSyncTime = Date.now();
    _lastSyncError = null;
    _syncCount++;
    _consecutiveFailures = 0;

    console.log(`[github-sync] Pushed ${allBlobs.length} files. GitHub commit: ${commit.sha.substring(0, 7)}`);
    return { success: true, sha: commit.sha, filesCount: allBlobs.length };
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    _lastSyncError = errorMsg;
    _lastAttemptTime = Date.now();
    _consecutiveFailures++;
    console.error(`[github-sync] Push failed (attempt ${_consecutiveFailures}):`, errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    _isSyncing = false;
  }
}

async function autoSync() {
  if (_consecutiveFailures >= 3 && _lastAttemptTime) {
    const backoffMinutes = Math.min(2 ** _consecutiveFailures, 60);
    const elapsed = (Date.now() - _lastAttemptTime) / 60000;
    if (elapsed < backoffMinutes) return;
  }
  const currentSha = getCurrentCommitSha();
  if (currentSha === _lastSyncCommit) return;
  console.log(`[github-sync] New commit detected (${currentSha.substring(0, 7)}), syncing...`);
  await pushToGitHub();
}

export function startAutoSync() {
  if (_syncTimer) return;
  console.log(`[github-sync] Auto-sync enabled (every ${SYNC_INTERVAL_MS / 1000}s) → ${REPO_OWNER}/${REPO_NAME}`);
  _lastSyncCommit = null;
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

export function getSyncStatus() {
  return {
    repo: `${REPO_OWNER}/${REPO_NAME}`,
    repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    autoSyncEnabled: !!_syncTimer,
    autoSyncIntervalSeconds: SYNC_INTERVAL_MS / 1000,
    isSyncing: _isSyncing,
    lastSyncCommit: _lastSyncCommit,
    lastSyncTime: _lastSyncTime ? new Date(_lastSyncTime).toISOString() : null,
    lastSyncError: _lastSyncError,
    totalSyncs: _syncCount,
    currentLocalCommit: getCurrentCommitSha(),
    needsSync: getCurrentCommitSha() !== _lastSyncCommit,
  };
}

export { pushToGitHub };
