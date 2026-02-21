import { storage } from "./storage";
import type { Card } from "@shared/schema";

const CADENCE_INTERVALS_MS: Record<string, number> = {
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  hourly: 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  quarterly: 90 * 24 * 60 * 60 * 1000,
  per_cycle: 0,
};

function parseCadence(cadence: string | null | undefined): number {
  if (!cadence) return 0;
  const lower = cadence.toLowerCase().trim();
  if (CADENCE_INTERVALS_MS[lower] !== undefined) return CADENCE_INTERVALS_MS[lower];

  const match = lower.match(/^(\d+)\s*(m|min|minutes?|h|hr|hours?|d|days?|w|weeks?)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const unit = match[2].charAt(0);
    switch (unit) {
      case "m": return num * 60 * 1000;
      case "h": return num * 60 * 60 * 1000;
      case "d": return num * 24 * 60 * 60 * 1000;
      case "w": return num * 7 * 24 * 60 * 60 * 1000;
    }
  }
  return 0;
}

function computeNextRefresh(lastRefreshed: Date | null, cadence: string | null | undefined): Date | null {
  const intervalMs = parseCadence(cadence);
  if (intervalMs <= 0) return null;
  const base = lastRefreshed || new Date();
  return new Date(base.getTime() + intervalMs);
}

let _schedulerInterval: ReturnType<typeof setInterval> | null = null;
let _lastRunAt: Date | null = null;
let _staleCount = 0;
let _checkCount = 0;

async function runRefreshCheck() {
  _checkCount++;
  try {
    const allCards = await storage.listCards();
    const scheduledCards = allCards.filter(
      (c) => c.refreshPolicy !== "manual" && c.refreshCadence
    );

    const now = new Date();
    let staleThisRun = 0;

    for (const card of scheduledCards) {
      const intervalMs = parseCadence(card.refreshCadence);
      if (intervalMs <= 0) continue;

      let nextRefresh = card.nextRefreshAt ? new Date(card.nextRefreshAt) : null;

      if (!nextRefresh) {
        const lastRefreshed = card.lastRefreshedAt ? new Date(card.lastRefreshedAt) : card.createdAt ? new Date(card.createdAt) : now;
        nextRefresh = new Date(lastRefreshed.getTime() + intervalMs);
        await storage.updateCard(card.id, {
          nextRefreshAt: nextRefresh,
        } as any);
      }

      if (now >= nextRefresh && card.refreshStatus !== "stale") {
        const advancedNext = new Date(now.getTime() + intervalMs);
        await storage.updateCard(card.id, {
          refreshStatus: "stale",
          nextRefreshAt: advancedNext,
        } as any);
        staleThisRun++;
        _staleCount++;
      }
    }

    _lastRunAt = now;
    if (staleThisRun > 0) {
      console.log(`[refresh-scheduler] Marked ${staleThisRun} card(s) as stale`);
    }
  } catch (e: any) {
    console.error("[refresh-scheduler] Check failed:", e.message);
  }
}

export function startRefreshScheduler(intervalMs = 60000) {
  if (_schedulerInterval) return;
  runRefreshCheck();
  _schedulerInterval = setInterval(runRefreshCheck, intervalMs);
  console.log(`[refresh-scheduler] Started (checking every ${intervalMs / 1000}s)`);
}

export function stopRefreshScheduler() {
  if (_schedulerInterval) {
    clearInterval(_schedulerInterval);
    _schedulerInterval = null;
  }
}

export function getSchedulerStatus() {
  return {
    running: !!_schedulerInterval,
    lastRunAt: _lastRunAt?.toISOString() ?? null,
    totalChecks: _checkCount,
    totalStaleMarked: _staleCount,
  };
}

export function refreshCardNow(card: Card): Date | null {
  const nextRefresh = computeNextRefresh(new Date(), card.refreshCadence);
  return nextRefresh;
}

export { parseCadence, computeNextRefresh };
