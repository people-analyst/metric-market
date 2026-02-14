import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RangeBuilderControl, RangeBuilderChangeEvent, RangeBuilderRow } from "@/components/controls/RangeBuilderControl";
import { RangeTargetBulletChart, BulletRangeRow } from "@/components/charts/RangeTargetBulletChart";

type SuperFunction = "R&D" | "GTM" | "OPS" | "G&A";
type LevelType = "Professional" | "Manager" | "Executive" | "Support";

interface LevelTypeConfig {
  prefix: string;
  levels: number[];
}

const LEVEL_TYPE_CONFIG: Record<LevelType, LevelTypeConfig> = {
  Professional: { prefix: "P", levels: [1, 2, 3, 4, 5, 6] },
  Manager: { prefix: "M", levels: [1, 2, 3, 4, 5, 6] },
  Executive: { prefix: "E", levels: [1, 2, 3, 4, 5] },
  Support: { prefix: "S", levels: [1, 2, 3, 4] },
};

interface LevelData {
  rangeMin: number;
  rangeMax: number;
  currentEmployees: number;
  avgCurrentPay: number;
  marketP50: number;
  marketP75: number;
  actualMin: number;
  actualMax: number;
  jobCount: number;
}

const JOB_STRUCTURE_DATA: Record<SuperFunction, Record<LevelType, Record<number, LevelData>>> = {
  "R&D": {
    Professional: {
      1: { rangeMin: 55000, rangeMax: 75000, currentEmployees: 42, avgCurrentPay: 64000, marketP50: 62000, marketP75: 72000, actualMin: 52000, actualMax: 78000, jobCount: 8 },
      2: { rangeMin: 72000, rangeMax: 98000, currentEmployees: 56, avgCurrentPay: 84000, marketP50: 82000, marketP75: 95000, actualMin: 70000, actualMax: 102000, jobCount: 7 },
      3: { rangeMin: 95000, rangeMax: 130000, currentEmployees: 68, avgCurrentPay: 112000, marketP50: 110000, marketP75: 128000, actualMin: 92000, actualMax: 135000, jobCount: 5 },
      4: { rangeMin: 125000, rangeMax: 170000, currentEmployees: 38, avgCurrentPay: 148000, marketP50: 145000, marketP75: 165000, actualMin: 122000, actualMax: 175000, jobCount: 3 },
      5: { rangeMin: 160000, rangeMax: 220000, currentEmployees: 18, avgCurrentPay: 192000, marketP50: 188000, marketP75: 215000, actualMin: 158000, actualMax: 228000, jobCount: 2 },
      6: { rangeMin: 200000, rangeMax: 280000, currentEmployees: 6, avgCurrentPay: 245000, marketP50: 240000, marketP75: 270000, actualMin: 198000, actualMax: 285000, jobCount: 1 },
    },
    Manager: {
      1: { rangeMin: 95000, rangeMax: 130000, currentEmployees: 22, avgCurrentPay: 112000, marketP50: 108000, marketP75: 125000, actualMin: 92000, actualMax: 134000, jobCount: 4 },
      2: { rangeMin: 125000, rangeMax: 170000, currentEmployees: 16, avgCurrentPay: 148000, marketP50: 142000, marketP75: 165000, actualMin: 120000, actualMax: 175000, jobCount: 3 },
      3: { rangeMin: 160000, rangeMax: 215000, currentEmployees: 12, avgCurrentPay: 188000, marketP50: 182000, marketP75: 210000, actualMin: 155000, actualMax: 220000, jobCount: 3 },
      4: { rangeMin: 200000, rangeMax: 270000, currentEmployees: 8, avgCurrentPay: 238000, marketP50: 230000, marketP75: 262000, actualMin: 195000, actualMax: 275000, jobCount: 2 },
      5: { rangeMin: 250000, rangeMax: 340000, currentEmployees: 4, avgCurrentPay: 298000, marketP50: 290000, marketP75: 330000, actualMin: 248000, actualMax: 345000, jobCount: 1 },
      6: { rangeMin: 310000, rangeMax: 420000, currentEmployees: 2, avgCurrentPay: 368000, marketP50: 360000, marketP75: 410000, actualMin: 308000, actualMax: 425000, jobCount: 1 },
    },
    Executive: {
      1: { rangeMin: 250000, rangeMax: 350000, currentEmployees: 4, avgCurrentPay: 302000, marketP50: 295000, marketP75: 340000, actualMin: 245000, actualMax: 358000, jobCount: 2 },
      2: { rangeMin: 320000, rangeMax: 440000, currentEmployees: 3, avgCurrentPay: 385000, marketP50: 375000, marketP75: 430000, actualMin: 315000, actualMax: 448000, jobCount: 1 },
      3: { rangeMin: 400000, rangeMax: 550000, currentEmployees: 2, avgCurrentPay: 480000, marketP50: 470000, marketP75: 540000, actualMin: 395000, actualMax: 560000, jobCount: 1 },
      4: { rangeMin: 500000, rangeMax: 700000, currentEmployees: 1, avgCurrentPay: 610000, marketP50: 600000, marketP75: 680000, actualMin: 500000, actualMax: 700000, jobCount: 1 },
      5: { rangeMin: 650000, rangeMax: 900000, currentEmployees: 1, avgCurrentPay: 780000, marketP50: 770000, marketP75: 880000, actualMin: 650000, actualMax: 900000, jobCount: 1 },
    },
    Support: {
      1: { rangeMin: 38000, rangeMax: 52000, currentEmployees: 15, avgCurrentPay: 44000, marketP50: 42000, marketP75: 50000, actualMin: 36000, actualMax: 54000, jobCount: 3 },
      2: { rangeMin: 48000, rangeMax: 66000, currentEmployees: 12, avgCurrentPay: 56000, marketP50: 54000, marketP75: 64000, actualMin: 46000, actualMax: 68000, jobCount: 2 },
      3: { rangeMin: 62000, rangeMax: 85000, currentEmployees: 8, avgCurrentPay: 72000, marketP50: 70000, marketP75: 82000, actualMin: 60000, actualMax: 88000, jobCount: 2 },
      4: { rangeMin: 80000, rangeMax: 110000, currentEmployees: 4, avgCurrentPay: 95000, marketP50: 92000, marketP75: 106000, actualMin: 78000, actualMax: 112000, jobCount: 1 },
    },
  },
  "GTM": {
    Professional: {
      1: { rangeMin: 50000, rangeMax: 68000, currentEmployees: 35, avgCurrentPay: 58000, marketP50: 56000, marketP75: 65000, actualMin: 48000, actualMax: 72000, jobCount: 6 },
      2: { rangeMin: 65000, rangeMax: 90000, currentEmployees: 48, avgCurrentPay: 76000, marketP50: 74000, marketP75: 88000, actualMin: 62000, actualMax: 94000, jobCount: 5 },
      3: { rangeMin: 85000, rangeMax: 120000, currentEmployees: 55, avgCurrentPay: 102000, marketP50: 98000, marketP75: 115000, actualMin: 82000, actualMax: 125000, jobCount: 4 },
      4: { rangeMin: 115000, rangeMax: 160000, currentEmployees: 30, avgCurrentPay: 138000, marketP50: 135000, marketP75: 155000, actualMin: 112000, actualMax: 165000, jobCount: 3 },
      5: { rangeMin: 150000, rangeMax: 210000, currentEmployees: 15, avgCurrentPay: 182000, marketP50: 178000, marketP75: 205000, actualMin: 148000, actualMax: 218000, jobCount: 2 },
      6: { rangeMin: 195000, rangeMax: 270000, currentEmployees: 5, avgCurrentPay: 235000, marketP50: 230000, marketP75: 262000, actualMin: 192000, actualMax: 275000, jobCount: 1 },
    },
    Manager: {
      1: { rangeMin: 90000, rangeMax: 125000, currentEmployees: 18, avgCurrentPay: 108000, marketP50: 105000, marketP75: 120000, actualMin: 88000, actualMax: 128000, jobCount: 3 },
      2: { rangeMin: 120000, rangeMax: 165000, currentEmployees: 14, avgCurrentPay: 142000, marketP50: 138000, marketP75: 160000, actualMin: 118000, actualMax: 170000, jobCount: 3 },
      3: { rangeMin: 155000, rangeMax: 210000, currentEmployees: 10, avgCurrentPay: 184000, marketP50: 180000, marketP75: 205000, actualMin: 152000, actualMax: 215000, jobCount: 2 },
      4: { rangeMin: 195000, rangeMax: 265000, currentEmployees: 6, avgCurrentPay: 232000, marketP50: 228000, marketP75: 258000, actualMin: 192000, actualMax: 270000, jobCount: 2 },
      5: { rangeMin: 245000, rangeMax: 335000, currentEmployees: 3, avgCurrentPay: 292000, marketP50: 285000, marketP75: 325000, actualMin: 242000, actualMax: 340000, jobCount: 1 },
      6: { rangeMin: 305000, rangeMax: 415000, currentEmployees: 2, avgCurrentPay: 362000, marketP50: 355000, marketP75: 405000, actualMin: 302000, actualMax: 420000, jobCount: 1 },
    },
    Executive: {
      1: { rangeMin: 240000, rangeMax: 340000, currentEmployees: 3, avgCurrentPay: 292000, marketP50: 285000, marketP75: 330000, actualMin: 238000, actualMax: 345000, jobCount: 1 },
      2: { rangeMin: 310000, rangeMax: 430000, currentEmployees: 2, avgCurrentPay: 375000, marketP50: 368000, marketP75: 420000, actualMin: 308000, actualMax: 435000, jobCount: 1 },
      3: { rangeMin: 390000, rangeMax: 540000, currentEmployees: 2, avgCurrentPay: 470000, marketP50: 462000, marketP75: 530000, actualMin: 388000, actualMax: 548000, jobCount: 1 },
      4: { rangeMin: 490000, rangeMax: 680000, currentEmployees: 1, avgCurrentPay: 595000, marketP50: 585000, marketP75: 665000, actualMin: 490000, actualMax: 680000, jobCount: 1 },
      5: { rangeMin: 640000, rangeMax: 880000, currentEmployees: 1, avgCurrentPay: 765000, marketP50: 755000, marketP75: 865000, actualMin: 640000, actualMax: 880000, jobCount: 1 },
    },
    Support: {
      1: { rangeMin: 36000, rangeMax: 50000, currentEmployees: 20, avgCurrentPay: 42000, marketP50: 40000, marketP75: 48000, actualMin: 34000, actualMax: 52000, jobCount: 4 },
      2: { rangeMin: 46000, rangeMax: 64000, currentEmployees: 14, avgCurrentPay: 54000, marketP50: 52000, marketP75: 62000, actualMin: 44000, actualMax: 66000, jobCount: 3 },
      3: { rangeMin: 60000, rangeMax: 82000, currentEmployees: 8, avgCurrentPay: 70000, marketP50: 68000, marketP75: 80000, actualMin: 58000, actualMax: 85000, jobCount: 2 },
      4: { rangeMin: 78000, rangeMax: 108000, currentEmployees: 4, avgCurrentPay: 92000, marketP50: 90000, marketP75: 104000, actualMin: 76000, actualMax: 110000, jobCount: 1 },
    },
  },
  "OPS": {
    Professional: {
      1: { rangeMin: 48000, rangeMax: 65000, currentEmployees: 30, avgCurrentPay: 56000, marketP50: 54000, marketP75: 63000, actualMin: 46000, actualMax: 68000, jobCount: 5 },
      2: { rangeMin: 62000, rangeMax: 85000, currentEmployees: 40, avgCurrentPay: 72000, marketP50: 70000, marketP75: 82000, actualMin: 60000, actualMax: 88000, jobCount: 4 },
      3: { rangeMin: 80000, rangeMax: 112000, currentEmployees: 45, avgCurrentPay: 95000, marketP50: 92000, marketP75: 108000, actualMin: 78000, actualMax: 115000, jobCount: 4 },
      4: { rangeMin: 105000, rangeMax: 148000, currentEmployees: 25, avgCurrentPay: 128000, marketP50: 124000, marketP75: 142000, actualMin: 102000, actualMax: 152000, jobCount: 3 },
      5: { rangeMin: 140000, rangeMax: 195000, currentEmployees: 12, avgCurrentPay: 168000, marketP50: 164000, marketP75: 190000, actualMin: 138000, actualMax: 200000, jobCount: 2 },
      6: { rangeMin: 180000, rangeMax: 250000, currentEmployees: 4, avgCurrentPay: 218000, marketP50: 214000, marketP75: 245000, actualMin: 178000, actualMax: 255000, jobCount: 1 },
    },
    Manager: {
      1: { rangeMin: 85000, rangeMax: 118000, currentEmployees: 16, avgCurrentPay: 102000, marketP50: 98000, marketP75: 115000, actualMin: 82000, actualMax: 122000, jobCount: 3 },
      2: { rangeMin: 112000, rangeMax: 155000, currentEmployees: 12, avgCurrentPay: 134000, marketP50: 130000, marketP75: 150000, actualMin: 110000, actualMax: 158000, jobCount: 2 },
      3: { rangeMin: 145000, rangeMax: 200000, currentEmployees: 8, avgCurrentPay: 174000, marketP50: 170000, marketP75: 195000, actualMin: 142000, actualMax: 205000, jobCount: 2 },
      4: { rangeMin: 185000, rangeMax: 255000, currentEmployees: 5, avgCurrentPay: 222000, marketP50: 218000, marketP75: 248000, actualMin: 182000, actualMax: 260000, jobCount: 1 },
      5: { rangeMin: 235000, rangeMax: 325000, currentEmployees: 3, avgCurrentPay: 282000, marketP50: 275000, marketP75: 318000, actualMin: 232000, actualMax: 330000, jobCount: 1 },
      6: { rangeMin: 295000, rangeMax: 405000, currentEmployees: 2, avgCurrentPay: 352000, marketP50: 345000, marketP75: 395000, actualMin: 292000, actualMax: 410000, jobCount: 1 },
    },
    Executive: {
      1: { rangeMin: 235000, rangeMax: 330000, currentEmployees: 3, avgCurrentPay: 285000, marketP50: 278000, marketP75: 322000, actualMin: 232000, actualMax: 335000, jobCount: 1 },
      2: { rangeMin: 300000, rangeMax: 420000, currentEmployees: 2, avgCurrentPay: 365000, marketP50: 358000, marketP75: 412000, actualMin: 298000, actualMax: 425000, jobCount: 1 },
      3: { rangeMin: 380000, rangeMax: 530000, currentEmployees: 1, avgCurrentPay: 460000, marketP50: 452000, marketP75: 520000, actualMin: 380000, actualMax: 530000, jobCount: 1 },
      4: { rangeMin: 480000, rangeMax: 670000, currentEmployees: 1, avgCurrentPay: 580000, marketP50: 572000, marketP75: 655000, actualMin: 480000, actualMax: 670000, jobCount: 1 },
      5: { rangeMin: 620000, rangeMax: 860000, currentEmployees: 1, avgCurrentPay: 745000, marketP50: 735000, marketP75: 845000, actualMin: 620000, actualMax: 860000, jobCount: 1 },
    },
    Support: {
      1: { rangeMin: 35000, rangeMax: 48000, currentEmployees: 25, avgCurrentPay: 41000, marketP50: 39000, marketP75: 46000, actualMin: 33000, actualMax: 50000, jobCount: 5 },
      2: { rangeMin: 44000, rangeMax: 62000, currentEmployees: 18, avgCurrentPay: 52000, marketP50: 50000, marketP75: 60000, actualMin: 42000, actualMax: 64000, jobCount: 3 },
      3: { rangeMin: 58000, rangeMax: 80000, currentEmployees: 10, avgCurrentPay: 68000, marketP50: 66000, marketP75: 78000, actualMin: 56000, actualMax: 82000, jobCount: 2 },
      4: { rangeMin: 75000, rangeMax: 105000, currentEmployees: 5, avgCurrentPay: 88000, marketP50: 86000, marketP75: 102000, actualMin: 73000, actualMax: 108000, jobCount: 1 },
    },
  },
  "G&A": {
    Professional: {
      1: { rangeMin: 50000, rangeMax: 68000, currentEmployees: 28, avgCurrentPay: 58000, marketP50: 56000, marketP75: 65000, actualMin: 48000, actualMax: 70000, jobCount: 5 },
      2: { rangeMin: 65000, rangeMax: 88000, currentEmployees: 36, avgCurrentPay: 75000, marketP50: 73000, marketP75: 85000, actualMin: 62000, actualMax: 92000, jobCount: 4 },
      3: { rangeMin: 84000, rangeMax: 115000, currentEmployees: 42, avgCurrentPay: 98000, marketP50: 95000, marketP75: 112000, actualMin: 82000, actualMax: 118000, jobCount: 4 },
      4: { rangeMin: 110000, rangeMax: 152000, currentEmployees: 22, avgCurrentPay: 132000, marketP50: 128000, marketP75: 148000, actualMin: 108000, actualMax: 156000, jobCount: 3 },
      5: { rangeMin: 145000, rangeMax: 200000, currentEmployees: 10, avgCurrentPay: 174000, marketP50: 170000, marketP75: 195000, actualMin: 142000, actualMax: 205000, jobCount: 2 },
      6: { rangeMin: 185000, rangeMax: 260000, currentEmployees: 4, avgCurrentPay: 225000, marketP50: 220000, marketP75: 252000, actualMin: 182000, actualMax: 265000, jobCount: 1 },
    },
    Manager: {
      1: { rangeMin: 88000, rangeMax: 122000, currentEmployees: 14, avgCurrentPay: 105000, marketP50: 102000, marketP75: 118000, actualMin: 86000, actualMax: 125000, jobCount: 3 },
      2: { rangeMin: 118000, rangeMax: 162000, currentEmployees: 10, avgCurrentPay: 140000, marketP50: 136000, marketP75: 158000, actualMin: 115000, actualMax: 165000, jobCount: 2 },
      3: { rangeMin: 152000, rangeMax: 208000, currentEmployees: 7, avgCurrentPay: 182000, marketP50: 178000, marketP75: 202000, actualMin: 150000, actualMax: 212000, jobCount: 2 },
      4: { rangeMin: 195000, rangeMax: 268000, currentEmployees: 4, avgCurrentPay: 234000, marketP50: 228000, marketP75: 260000, actualMin: 192000, actualMax: 272000, jobCount: 1 },
      5: { rangeMin: 248000, rangeMax: 340000, currentEmployees: 2, avgCurrentPay: 296000, marketP50: 288000, marketP75: 332000, actualMin: 245000, actualMax: 345000, jobCount: 1 },
      6: { rangeMin: 308000, rangeMax: 425000, currentEmployees: 1, avgCurrentPay: 370000, marketP50: 362000, marketP75: 415000, actualMin: 308000, actualMax: 425000, jobCount: 1 },
    },
    Executive: {
      1: { rangeMin: 245000, rangeMax: 345000, currentEmployees: 3, avgCurrentPay: 298000, marketP50: 290000, marketP75: 335000, actualMin: 242000, actualMax: 350000, jobCount: 1 },
      2: { rangeMin: 315000, rangeMax: 435000, currentEmployees: 2, avgCurrentPay: 380000, marketP50: 372000, marketP75: 425000, actualMin: 312000, actualMax: 440000, jobCount: 1 },
      3: { rangeMin: 395000, rangeMax: 545000, currentEmployees: 1, avgCurrentPay: 475000, marketP50: 465000, marketP75: 535000, actualMin: 395000, actualMax: 545000, jobCount: 1 },
      4: { rangeMin: 495000, rangeMax: 690000, currentEmployees: 1, avgCurrentPay: 600000, marketP50: 590000, marketP75: 675000, actualMin: 495000, actualMax: 690000, jobCount: 1 },
      5: { rangeMin: 645000, rangeMax: 895000, currentEmployees: 1, avgCurrentPay: 775000, marketP50: 765000, marketP75: 880000, actualMin: 645000, actualMax: 895000, jobCount: 1 },
    },
    Support: {
      1: { rangeMin: 37000, rangeMax: 51000, currentEmployees: 22, avgCurrentPay: 43000, marketP50: 41000, marketP75: 49000, actualMin: 35000, actualMax: 53000, jobCount: 4 },
      2: { rangeMin: 47000, rangeMax: 65000, currentEmployees: 16, avgCurrentPay: 55000, marketP50: 53000, marketP75: 63000, actualMin: 45000, actualMax: 67000, jobCount: 3 },
      3: { rangeMin: 61000, rangeMax: 84000, currentEmployees: 9, avgCurrentPay: 71000, marketP50: 69000, marketP75: 81000, actualMin: 59000, actualMax: 86000, jobCount: 2 },
      4: { rangeMin: 79000, rangeMax: 110000, currentEmployees: 4, avgCurrentPay: 94000, marketP50: 91000, marketP75: 106000, actualMin: 77000, actualMax: 112000, jobCount: 1 },
    },
  },
};

const SUPER_FUNCTIONS: SuperFunction[] = ["R&D", "GTM", "OPS", "G&A"];
const LEVEL_TYPES: LevelType[] = ["Professional", "Manager", "Executive", "Support"];

function getLevelDataForSelection(superFn: SuperFunction, levelType: LevelType) {
  const cfg = LEVEL_TYPE_CONFIG[levelType];
  const fnData = JOB_STRUCTURE_DATA[superFn]?.[levelType] || {};
  const levels = cfg.levels.filter((l) => fnData[l]);

  const rows: RangeBuilderRow[] = [];
  const marketData: { p50: number; p75: number }[] = [];
  const actuals: { actualMin: number; actualMax: number }[] = [];
  const jobCounts: number[] = [];

  for (const lvl of levels) {
    const d = fnData[lvl];
    if (!d) continue;
    rows.push({
      label: `${cfg.prefix}${lvl}`,
      rangeMin: d.rangeMin,
      rangeMax: d.rangeMax,
      currentEmployees: d.currentEmployees,
      avgCurrentPay: d.avgCurrentPay,
    });
    marketData.push({ p50: d.marketP50, p75: d.marketP75 });
    actuals.push({ actualMin: d.actualMin, actualMax: d.actualMax });
    jobCounts.push(d.jobCount);
  }

  let globalMin = Infinity, globalMax = -Infinity;
  for (const d of Object.values(fnData)) {
    globalMin = Math.min(globalMin, d.rangeMin, d.actualMin, d.marketP50 - (d.marketP75 - d.marketP50));
    globalMax = Math.max(globalMax, d.rangeMax, d.actualMax, d.marketP75);
  }
  const pad = (globalMax - globalMin) * 0.1;
  const scaleMin = Math.floor((globalMin - pad) / 5000) * 5000;
  const scaleMax = Math.ceil((globalMax + pad) / 5000) * 5000;

  return { rows, marketData, actuals, jobCounts, scaleMin, scaleMax };
}

interface TargetRangeStats {
  label: string;
  min: number;
  max: number;
  mid: number;
  spreadPct: number;
  minOverlapPct: number | null;
  maxOverlapPct: number | null;
  levelBelowPct: number | null;
  levelAbovePct: number | null;
  promoOppPct: number | null;
}

function computeTargetRangeStats(activeRanges: { label: string; min: number; max: number }[]): TargetRangeStats[] {
  return activeRanges.map((r, i) => {
    const mid = (r.min + r.max) / 2;
    const spreadPct = r.min > 0 ? ((r.max - r.min) / r.min) * 100 : 0;

    const below = i > 0 ? activeRanges[i - 1] : null;
    const above = i < activeRanges.length - 1 ? activeRanges[i + 1] : null;

    let minOverlapPct: number | null = null;
    if (below) {
      const overlap = Math.max(0, below.max - r.min);
      const belowSpread = below.max - below.min;
      minOverlapPct = belowSpread > 0 ? (overlap / belowSpread) * 100 : 0;
    }

    let maxOverlapPct: number | null = null;
    if (above) {
      const overlap = Math.max(0, r.max - above.min);
      const currentSpread = r.max - r.min;
      maxOverlapPct = currentSpread > 0 ? (overlap / currentSpread) * 100 : 0;
    }

    const belowMid = below ? (below.min + below.max) / 2 : null;
    const aboveMid = above ? (above.min + above.max) / 2 : null;

    const levelBelowPct = belowMid && belowMid > 0 ? ((mid - belowMid) / belowMid) * 100 : null;
    const levelAbovePct = aboveMid && mid > 0 ? ((aboveMid - mid) / mid) * 100 : null;
    const promoOppPct = above && mid > 0 ? ((above.min - mid) / mid) * 100 : null;

    return { label: r.label, min: r.min, max: r.max, mid, spreadPct, minOverlapPct, maxOverlapPct, levelBelowPct, levelAbovePct, promoOppPct };
  });
}

export function RangeBuilderPage() {
  const [superFn, setSuperFn] = useState<SuperFunction>("R&D");
  const [levelType, setLevelType] = useState<LevelType>("Professional");
  const [lastEvent, setLastEvent] = useState<RangeBuilderChangeEvent | null>(null);

  const { rows, marketData, actuals, jobCounts, scaleMin, scaleMax } = useMemo(
    () => getLevelDataForSelection(superFn, levelType),
    [superFn, levelType]
  );

  const handleSuperFnChange = useCallback((fn: SuperFunction) => {
    setSuperFn(fn);
    setLastEvent(null);
  }, []);

  const handleLevelTypeChange = useCallback((lt: LevelType) => {
    setLevelType(lt);
    setLastEvent(null);
  }, []);

  const handleChange = useCallback((event: RangeBuilderChangeEvent) => {
    setLastEvent(event);
  }, []);

  const bulletRows: BulletRangeRow[] = useMemo(() => {
    return rows.map((row, i) => {
      const market = marketData[i];
      const actual = actuals[i];
      const activeRange = lastEvent?.activeRanges[i];
      return {
        label: row.label,
        marketMin: market.p50 - (market.p75 - market.p50),
        marketMax: market.p75,
        targetMin: activeRange?.min ?? row.rangeMin,
        targetMax: activeRange?.max ?? row.rangeMax,
        actualMin: actual.actualMin,
        actualMax: actual.actualMax,
      };
    });
  }, [rows, marketData, actuals, lastEvent]);

  const activeRanges = useMemo(() => {
    if (lastEvent) return lastEvent.activeRanges;
    return rows.map((r) => ({ label: r.label, min: r.rangeMin, max: r.rangeMax }));
  }, [lastEvent, rows]);

  const rangeStats = useMemo(() => computeTargetRangeStats(activeRanges), [activeRanges]);

  const totalJobs = jobCounts.reduce((a, b) => a + b, 0);
  const totalEmployees = rows.reduce((a, r) => a + (r.currentEmployees ?? 0), 0);

  const stepSize = useMemo(() => {
    const range = scaleMax - scaleMin;
    if (range > 500000) return 25000;
    if (range > 200000) return 10000;
    return 5000;
  }, [scaleMin, scaleMax]);

  const fmtPct = (v: number | null) => {
    if (v === null) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  };

  const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}k`;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4" data-testid="page-range-builder">
      <div>
        <h1 className="text-lg font-bold text-foreground" data-testid="text-page-title">Range Builder</h1>
        <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-page-description">
          Adjust compensation ranges and see real-time impact on cost, pay equity, competitiveness, and affected employees
        </p>
      </div>

      <Card>
        <CardContent className="px-4 py-3">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide" data-testid="label-super-function">Super Job Function</span>
              <div className="flex flex-wrap gap-1.5 mt-1" data-testid="filter-super-function">
                {SUPER_FUNCTIONS.map((fn) => (
                  <Button
                    key={fn}
                    size="sm"
                    variant={superFn === fn ? "default" : "outline"}
                    className={`text-xs h-7 px-3 ${superFn === fn ? "bg-[#0f69ff]" : ""}`}
                    onClick={() => handleSuperFnChange(fn)}
                    data-testid={`button-fn-${fn}`}
                  >
                    {fn}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide" data-testid="label-level-type">Level Type</span>
              <div className="flex flex-wrap gap-1.5 mt-1" data-testid="filter-level-type">
                {LEVEL_TYPES.map((lt) => (
                  <Button
                    key={lt}
                    size="sm"
                    variant={levelType === lt ? "default" : "outline"}
                    className={`text-xs h-7 px-3 ${levelType === lt ? "bg-[#0f69ff]" : ""}`}
                    onClick={() => handleLevelTypeChange(lt)}
                    data-testid={`button-lt-${lt}`}
                  >
                    {lt} ({LEVEL_TYPE_CONFIG[lt].prefix}1-{LEVEL_TYPE_CONFIG[lt].prefix}{LEVEL_TYPE_CONFIG[lt].levels[LEVEL_TYPE_CONFIG[lt].levels.length - 1]})
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border" data-testid="filter-summary">
              <span>Viewing: <span className="font-semibold text-foreground">{superFn}</span> <span className="font-semibold text-foreground">{LEVEL_TYPE_CONFIG[levelType].prefix}-levels</span></span>
              <span>{rows.length} levels</span>
              <span>{totalJobs} jobs</span>
              <span>{totalEmployees} employees</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 pt-3 px-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground" data-testid="text-section-title">{superFn} {LEVEL_TYPE_CONFIG[levelType].prefix}-Level Pay Ranges</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Click boxes to extend or shrink compensation ranges</p>
          </div>
          <Badge variant="secondary" className="text-[10px]" data-testid="badge-control-type">Form Control</Badge>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1">
          <RangeBuilderControl
            key={`${superFn}-${levelType}`}
            rows={rows}
            stepSize={stepSize}
            scaleMin={scaleMin}
            scaleMax={scaleMax}
            marketData={marketData}
            onChange={handleChange}
            autoRecalculate
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 pt-3 px-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground" data-testid="text-bullet-title">Target Range Analysis</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Market range, target range, and actual employee pay extremes</p>
          </div>
          <Badge variant="secondary" className="text-[10px]" data-testid="badge-chart-type">Bullet Chart</Badge>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <RangeTargetBulletChart
            rows={bulletRows}
            scaleMin={scaleMin}
            scaleMax={scaleMax}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground" data-testid="bullet-chart-legend">
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#e0e4e9", opacity: 0.5 }} />
              Scale
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#b8d4f0", opacity: 0.7 }} />
              Market Range
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#0f69ff", opacity: 0.85 }} />
              Target Range
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="10" viewBox="0 0 12 10"><polygon points="6,0 12,5 6,10" fill="#0f69ff" /></svg>
              Target end (in Market)
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="10" viewBox="0 0 12 10"><polygon points="6,0 12,5 6,10" fill="#9ca3af" /></svg>
              Target end (outside Market)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#0f69ff" /></svg>
              Actual (in Target + Market)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="white" stroke="#0f69ff" strokeWidth="1.5" /></svg>
              Actual (in Target only)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="white" stroke="#232a31" strokeWidth="1.5" /></svg>
              Actual (in Market only)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#232a31" /></svg>
              Actual (outside both)
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <h3 className="text-sm font-semibold text-foreground" data-testid="text-stats-title">Target Range Statistics</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Structural metrics for the current target ranges</p>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1">
          <div className="overflow-x-auto" data-testid="range-stats-table">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-3 font-semibold text-muted-foreground">Level</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Min</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Mid</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Max</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground" title="(Max - Min) / Min">Spread %</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground" title="Overlap of this range's min with range below max, as % of below's spread">Min Overlap %</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground" title="Overlap of this range's max with range above min, as % of this range's spread">Max Overlap %</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground" title="% decrease from this mid to level below mid">Below %</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground" title="% increase from this mid to level above mid">Above %</th>
                  <th className="text-right py-1.5 pl-2 font-semibold text-muted-foreground" title="% increase from this mid to min of level above">Promo Opp %</th>
                </tr>
              </thead>
              <tbody>
                {rangeStats.map((s) => (
                  <tr key={s.label} className="border-b border-border/50" data-testid={`stat-row-${s.label}`}>
                    <td className="py-1.5 pr-3 font-semibold text-foreground">{s.label}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{fmtK(s.min)}</td>
                    <td className="py-1.5 px-2 text-right text-foreground font-medium">{fmtK(s.mid)}</td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{fmtK(s.max)}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{s.spreadPct.toFixed(1)}%</td>
                    <td className={`py-1.5 px-2 text-right ${s.minOverlapPct !== null && s.minOverlapPct > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {s.minOverlapPct !== null ? `${s.minOverlapPct.toFixed(1)}%` : "—"}
                    </td>
                    <td className={`py-1.5 px-2 text-right ${s.maxOverlapPct !== null && s.maxOverlapPct > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {s.maxOverlapPct !== null ? `${s.maxOverlapPct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-1.5 px-2 text-right text-muted-foreground">{fmtPct(s.levelBelowPct !== null ? -s.levelBelowPct : null)}</td>
                    <td className="py-1.5 px-2 text-right text-foreground">{fmtPct(s.levelAbovePct)}</td>
                    <td className={`py-1.5 pl-2 text-right ${s.promoOppPct !== null && s.promoOppPct < 0 ? "text-red-600" : "text-foreground"}`}>
                      {fmtPct(s.promoOppPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
