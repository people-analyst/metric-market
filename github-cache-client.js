/**
 * People Analytics GitHub Cache Client v1.0.0
 * Lightweight ETag caching, rate limit tracking, and retry/backoff
 * for GitHub API calls in spoke applications.
 *
 * DROP-IN SETUP:
 *   const ghCache = require("./github-cache-client");
 *
 * ENV OPTIONAL:
 *   GITHUB_TOKEN — personal access token for authenticated requests (higher rate limits)
 *
 * USAGE:
 *   const data = await ghCache.cachedRequest("/repos/owner/repo/contents/file.js");
 *   const status = ghCache.getRateLimitStatus();
 *   const stats = ghCache.getCacheStats();
 *
 * This module is distributed by the PA Hub. Do NOT edit — pull updates from Hub.
 */

const CACHE_SDK_VERSION = "1.0.0";

// ─── Configuration ─────────────────────────────────────────────────
const GITHUB_API_BASE = "https://api.github.com";
const CACHE_TTLS = {
  tree: 10 * 60 * 1000,
  ref: 5 * 60 * 1000,
  content: 15 * 60 * 1000,
  default: 10 * 60 * 1000,
};
const RATE_LIMIT_FLOOR = 100;
const BACKOFF_BASE_MS = 2000;
const MAX_RETRIES = 3;
const MAX_CACHE_ENTRIES = 500;
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;

// ─── Internal State ────────────────────────────────────────────────
const _cache = new Map();
const _rateLimitState = {
  remaining: 5000,
  limit: 5000,
  reset: 0,
  lastChecked: 0,
};
let _pruneTimer = null;
let _totalRequests = 0;
let _cacheHits = 0;

// ─── Cache Helpers ─────────────────────────────────────────────────

function _isExpired(entry) {
  return Date.now() - entry.cachedAt > entry.ttlMs;
}

function _detectTTL(path) {
  if (path.includes("/git/trees/")) return CACHE_TTLS.tree;
  if (path.includes("/git/ref/") || path.includes("/git/refs/")) return CACHE_TTLS.ref;
  if (path.includes("/contents/")) return CACHE_TTLS.content;
  return CACHE_TTLS.default;
}

function _pruneCache() {
  const toDelete = [];
  _cache.forEach(function(entry, key) {
    if (_isExpired(entry)) toDelete.push(key);
  });
  toDelete.forEach(function(k) { _cache.delete(k); });

  if (_cache.size > MAX_CACHE_ENTRIES) {
    var entries = Array.from(_cache.entries());
    entries.sort(function(a, b) { return a[1].cachedAt - b[1].cachedAt; });
    var excess = _cache.size - MAX_CACHE_ENTRIES;
    for (var i = 0; i < excess; i++) {
      _cache.delete(entries[i][0]);
    }
  }
}

function _startPruning() {
  if (!_pruneTimer) {
    _pruneTimer = setInterval(_pruneCache, PRUNE_INTERVAL_MS);
    if (_pruneTimer.unref) _pruneTimer.unref();
  }
}

// ─── Rate Limit Tracking ──────────────────────────────────────────

function _updateRateLimit(headers) {
  if (!headers) return;
  var remaining = headers.get ? headers.get("x-ratelimit-remaining") : headers["x-ratelimit-remaining"];
  var limit = headers.get ? headers.get("x-ratelimit-limit") : headers["x-ratelimit-limit"];
  var reset = headers.get ? headers.get("x-ratelimit-reset") : headers["x-ratelimit-reset"];
  if (remaining != null) _rateLimitState.remaining = parseInt(remaining, 10);
  if (limit != null) _rateLimitState.limit = parseInt(limit, 10);
  if (reset != null) _rateLimitState.reset = parseInt(reset, 10);
  _rateLimitState.lastChecked = Date.now();
}

async function _waitForRateLimit() {
  if (_rateLimitState.remaining > RATE_LIMIT_FLOOR) return;
  var now = Date.now();
  var resetMs = _rateLimitState.reset * 1000;
  if (resetMs > now) {
    var waitMs = Math.min(resetMs - now + 1000, 60000);
    console.log("[gh-cache] Rate limit low (" + _rateLimitState.remaining + " remaining). Waiting " + Math.round(waitMs / 1000) + "s...");
    await new Promise(function(resolve) { setTimeout(resolve, waitMs); });
  }
}

// ─── Auth Headers ──────────────────────────────────────────────────

function _getHeaders(extraHeaders) {
  var headers = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "PA-Spoke-Cache/" + CACHE_SDK_VERSION,
  };
  var token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = "token " + token;
  }
  if (extraHeaders) {
    Object.keys(extraHeaders).forEach(function(k) {
      headers[k] = extraHeaders[k];
    });
  }
  return headers;
}

// ─── Core Cached Request ──────────────────────────────────────────

async function cachedRequest(path, options) {
  _startPruning();
  _totalRequests++;

  var opts = options || {};
  var method = (opts.method || "GET").toUpperCase();
  var fullUrl = path.startsWith("http") ? path : GITHUB_API_BASE + (path.startsWith("/") ? path : "/" + path);
  var cacheKey = method + "::" + fullUrl;
  var ttl = opts.ttl || _detectTTL(path);

  if (method === "GET") {
    var cached = _cache.get(cacheKey);
    if (cached && !_isExpired(cached)) {
      cached.hits++;
      _cacheHits++;
      return cached.data;
    }
  }

  var lastError;
  for (var attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await _waitForRateLimit();

    try {
      var reqHeaders = _getHeaders(opts.headers);

      if (method === "GET") {
        var existingEntry = _cache.get(cacheKey);
        if (existingEntry && existingEntry.etag) {
          reqHeaders["If-None-Match"] = existingEntry.etag;
        }
      }

      var fetchOpts = {
        method: method,
        headers: reqHeaders,
      };
      if (opts.body) fetchOpts.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);

      var resp = await fetch(fullUrl, fetchOpts);
      _updateRateLimit(resp.headers);

      if (resp.status === 304 && _cache.has(cacheKey)) {
        var hit = _cache.get(cacheKey);
        hit.cachedAt = Date.now();
        hit.hits++;
        _cacheHits++;
        return hit.data;
      }

      if (resp.status === 403) {
        var body = await resp.text();
        if (body.includes("rate limit") || body.includes("API rate limit")) {
          var resetHeader = resp.headers.get ? resp.headers.get("x-ratelimit-reset") : null;
          if (resetHeader) {
            _rateLimitState.remaining = 0;
            _rateLimitState.reset = parseInt(resetHeader, 10);
          }
          var backoff = BACKOFF_BASE_MS * Math.pow(2, attempt) + Math.random() * 1000;
          console.warn("[gh-cache] Rate limited on " + path + ". Retry " + (attempt + 1) + "/" + MAX_RETRIES + " in " + Math.round(backoff / 1000) + "s");
          await new Promise(function(resolve) { setTimeout(resolve, backoff); });
          lastError = new Error("GitHub API rate limit exceeded");
          continue;
        }
      }

      if (!resp.ok) {
        throw new Error("GitHub API error " + resp.status + " on " + method + " " + path);
      }

      var data = await resp.json();

      if (method === "GET") {
        var etag = resp.headers.get ? resp.headers.get("etag") : (resp.headers.etag || null);
        _cache.set(cacheKey, {
          data: data,
          etag: etag,
          cachedAt: Date.now(),
          ttlMs: ttl,
          hits: 0,
        });
      }

      return data;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES && err.message && err.message.includes("rate limit")) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ─── Convenience Methods ──────────────────────────────────────────

async function getRepoTree(owner, repo, branch) {
  branch = branch || "main";
  var ref = await cachedRequest("/repos/" + owner + "/" + repo + "/git/ref/heads/" + branch);
  var commitSha = ref.object.sha;
  var commit = await cachedRequest("/repos/" + owner + "/" + repo + "/git/commits/" + commitSha);
  return cachedRequest("/repos/" + owner + "/" + repo + "/git/trees/" + commit.tree.sha + "?recursive=1");
}

async function getFileContent(owner, repo, filePath, ref) {
  ref = ref || "main";
  var data = await cachedRequest("/repos/" + owner + "/" + repo + "/contents/" + filePath + "?ref=" + ref);
  if (data.encoding === "base64" && data.content) {
    data.decodedContent = Buffer.from(data.content, "base64").toString("utf-8");
  }
  return data;
}

async function getRepoInfo(owner, repo) {
  return cachedRequest("/repos/" + owner + "/" + repo);
}

// ─── Status & Stats ───────────────────────────────────────────────

function getRateLimitStatus() {
  var now = Date.now();
  var resetsIn = Math.max(0, _rateLimitState.reset * 1000 - now);
  return {
    remaining: _rateLimitState.remaining,
    limit: _rateLimitState.limit,
    reset: _rateLimitState.reset > 0 ? new Date(_rateLimitState.reset * 1000).toISOString() : null,
    lastChecked: _rateLimitState.lastChecked > 0 ? new Date(_rateLimitState.lastChecked).toISOString() : null,
    usedPercent: _rateLimitState.limit > 0
      ? Math.round((_rateLimitState.limit - _rateLimitState.remaining) / _rateLimitState.limit * 100)
      : 0,
    resetsInSeconds: Math.round(resetsIn / 1000),
    isLow: _rateLimitState.remaining < RATE_LIMIT_FLOOR * 2,
    isCritical: _rateLimitState.remaining < RATE_LIMIT_FLOOR,
  };
}

function getCacheStats() {
  var active = 0;
  var stale = 0;
  _cache.forEach(function(entry) {
    if (_isExpired(entry)) stale++;
    else active++;
  });
  return {
    version: CACHE_SDK_VERSION,
    entries: active,
    staleEntries: stale,
    totalEntries: _cache.size,
    totalRequests: _totalRequests,
    cacheHits: _cacheHits,
    hitRate: _totalRequests > 0 ? Math.round((_cacheHits / _totalRequests) * 100) + "%" : "0%",
    maxEntries: MAX_CACHE_ENTRIES,
  };
}

// ─── Cache Management ─────────────────────────────────────────────

function invalidateRepo(owner, repo) {
  var prefix = "GET::" + GITHUB_API_BASE + "/repos/" + owner + "/" + repo;
  var toDelete = [];
  _cache.forEach(function(_, key) {
    if (key.startsWith(prefix)) toDelete.push(key);
  });
  toDelete.forEach(function(k) { _cache.delete(k); });
  return toDelete.length;
}

function invalidateAll() {
  var count = _cache.size;
  _cache.clear();
  return count;
}

// ─── Express Route Registration ───────────────────────────────────

function registerRoutes(app) {
  if (!app) return;

  app.get("/api/github/cache-status", function(_req, res) {
    res.json({
      rateLimit: getRateLimitStatus(),
      cache: getCacheStats(),
    });
  });

  console.log("[gh-cache] Route registered: GET /api/github/cache-status");
}

// ─── Exports ──────────────────────────────────────────────────────

module.exports = {
  CACHE_SDK_VERSION: CACHE_SDK_VERSION,

  cachedRequest: cachedRequest,
  getRepoTree: getRepoTree,
  getFileContent: getFileContent,
  getRepoInfo: getRepoInfo,

  getRateLimitStatus: getRateLimitStatus,
  getCacheStats: getCacheStats,

  invalidateRepo: invalidateRepo,
  invalidateAll: invalidateAll,

  registerRoutes: registerRoutes,
};
