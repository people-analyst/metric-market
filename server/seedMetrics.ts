import { storage } from "./storage";
import { PERFORMANCE_METRIC_DEFINITIONS } from "./performanceMetricDefinitions";
import { log } from "./vite";

export async function seedPerformanceMetrics() {
  let seeded = 0;
  let skipped = 0;
  for (const def of PERFORMANCE_METRIC_DEFINITIONS) {
    const existing = await storage.getMetricDefinitionByKey(def.key);
    if (existing) {
      skipped++;
    } else {
      await storage.createMetricDefinition(def);
      seeded++;
    }
  }
  if (seeded > 0) {
    log(`Performance Metrics: ${seeded} seeded, ${skipped} skipped (${PERFORMANCE_METRIC_DEFINITIONS.length} total definitions)`);
  }
}
