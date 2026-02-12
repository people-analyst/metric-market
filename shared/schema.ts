import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
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
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

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

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
