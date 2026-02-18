# Kanban Spoke Upgrade Guide

## Upgrading Your Spoke Kanban

When the central Kanban system is upgraded, a new export package can be generated and applied to your spoke.

### Upgrade Steps

1. **Download new package** from the central Kanban Export page
2. **Back up your data**: Export your current cards via `GET /api/kanban/export`
3. **Update schema**: Replace `kanban-schema.ts` with the new version. Run `npm run db:push`
4. **Update routes**: Replace `kanban-routes.ts` with the new version
5. **Update components**: Replace UI components with new versions
6. **Re-import data**: If needed, re-import your backed-up cards

### Version Compatibility
The manifest.json in each package includes version information. Always check compatibility before upgrading.

### What Gets Upgraded
- Schema definitions (new fields, validation rules)
- API routes (new endpoints, improved validation)
- UI components (new features, bug fixes)
- Documentation (updated guides)

### What Stays Local
- Your card data (preserved across upgrades)
- Custom configurations
- App-specific modifications
