import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const CHART_TYPES = [
  "confidence_band",
  "alluvial",
  "waffle_bar",
  "bullet_bar",
  "slope_comparison",
  "bubble_scatter",
  "box_whisker",
  "strip_timeline",
  "waffle_percent",
  "heatmap",
  "strip_dot",
  "multi_line",
  "tile_cartogram",
  "timeline_milestone",
  "control",
  "dendrogram",
  "radial_bar",
  "bump",
  "sparkline_rows",
  "stacked_area",
  "range_strip",
  "range_strip_aligned",
  "interactive_range_strip",
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export const cardBundles = pgTable("card_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  chartType: text("chart_type").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  version: integer("version").notNull().default(1),
  dataSchema: jsonb("data_schema").notNull(),
  configSchema: jsonb("config_schema").notNull(),
  outputSchema: jsonb("output_schema").notNull().default({}),
  defaults: jsonb("defaults").notNull().default({}),
  exampleData: jsonb("example_data").notNull().default({}),
  exampleConfig: jsonb("example_config").notNull().default({}),
  documentation: text("documentation"),
  category: text("category"),
  tags: text("tags").array(),
  infrastructureNotes: text("infrastructure_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCardBundleSchema = createInsertSchema(cardBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCardBundle = z.infer<typeof insertCardBundleSchema>;
export type CardBundle = typeof cardBundles.$inferSelect;

export const metricDefinitions = pgTable("metric_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unit: text("unit"),
  unitLabel: text("unit_label"),
  source: text("source"),
  calculationNotes: text("calculation_notes"),
  cadence: text("cadence"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMetricDefinitionSchema = createInsertSchema(metricDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMetricDefinition = z.infer<typeof insertMetricDefinitionSchema>;
export type MetricDefinition = typeof metricDefinitions.$inferSelect;

export const chartConfigs = pgTable("chart_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  chartType: text("chart_type").notNull(),
  bundleId: varchar("bundle_id").references(() => cardBundles.id),
  description: text("description"),
  settings: jsonb("settings").notNull().default({}),
  defaultWidth: integer("default_width"),
  defaultHeight: integer("default_height"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChartConfigSchema = createInsertSchema(chartConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChartConfig = z.infer<typeof insertChartConfigSchema>;
export type ChartConfig = typeof chartConfigs.$inferSelect;

export const CARD_STATUSES = ["draft", "active", "archived", "needs_refresh"] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const REFRESH_POLICIES = ["manual", "on_demand", "scheduled"] as const;
export type RefreshPolicy = (typeof REFRESH_POLICIES)[number];

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bundleId: varchar("bundle_id").references(() => cardBundles.id),
  metricId: varchar("metric_id").references(() => metricDefinitions.id),
  chartConfigId: varchar("chart_config_id").references(() => chartConfigs.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  tags: text("tags").array(),
  sourceAttribution: text("source_attribution"),
  createdBy: text("created_by"),
  status: text("status").notNull().default("draft"),
  isPublished: boolean("is_published").notNull().default(false),
  metadata: jsonb("metadata").default({}),
  refreshPolicy: text("refresh_policy").notNull().default("manual"),
  refreshCadence: text("refresh_cadence"),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  nextRefreshAt: timestamp("next_refresh_at"),
  refreshStatus: text("refresh_status").default("current"),
  importance: real("importance"),
  significance: real("significance"),
  relevance: real("relevance"),
  scoringMetadata: jsonb("scoring_metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export const RELATION_TYPES = ["drilldown", "component_of", "related", "parent"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const cardRelations = pgTable("card_relations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceCardId: varchar("source_card_id").notNull().references(() => cards.id),
  targetCardId: varchar("target_card_id").notNull().references(() => cards.id),
  relationType: text("relation_type").notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").default(0),
  navigationContext: jsonb("navigation_context").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCardRelationSchema = createInsertSchema(cardRelations).omit({
  id: true,
  createdAt: true,
});

export type InsertCardRelation = z.infer<typeof insertCardRelationSchema>;
export type CardRelation = typeof cardRelations.$inferSelect;

export const cardData = pgTable("card_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull().references(() => cards.id),
  payload: jsonb("payload").notNull(),
  periodLabel: text("period_label"),
  effectiveAt: timestamp("effective_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCardDataSchema = createInsertSchema(cardData).omit({
  id: true,
  createdAt: true,
});

export type InsertCardData = z.infer<typeof insertCardDataSchema>;
export type CardData = typeof cardData.$inferSelect;
