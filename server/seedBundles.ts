import { storage } from "./storage";
import { BUNDLE_DEFINITIONS } from "./bundleDefinitions";
import { log } from "./vite";

export async function seedBundles() {
  let seeded = 0;
  let updated = 0;
  for (const def of BUNDLE_DEFINITIONS) {
    const existing = await storage.getCardBundleByKey(def.key);
    if (existing) {
      if (existing.version < (def.version ?? 1)) {
        await storage.updateCardBundle(existing.id, def);
        updated++;
      }
    } else {
      await storage.createCardBundle(def);
      seeded++;
    }
  }
  if (seeded > 0 || updated > 0) {
    log(`Bundles: ${seeded} seeded, ${updated} updated (${BUNDLE_DEFINITIONS.length} total)`);
  }
}
