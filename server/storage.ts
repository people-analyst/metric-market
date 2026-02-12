import { eq, desc, and, or } from "drizzle-orm";
import { db } from "./db";
import {
  type User, type InsertUser,
  type MetricDefinition, type InsertMetricDefinition,
  type ChartConfig, type InsertChartConfig,
  type Card, type InsertCard,
  type CardData, type InsertCardData,
  type CardBundle, type InsertCardBundle,
  type CardRelation, type InsertCardRelation,
  users, metricDefinitions, chartConfigs, cards, cardData, cardBundles, cardRelations,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  listCardBundles(): Promise<CardBundle[]>;
  getCardBundle(id: string): Promise<CardBundle | undefined>;
  getCardBundleByKey(key: string): Promise<CardBundle | undefined>;
  createCardBundle(b: InsertCardBundle): Promise<CardBundle>;
  updateCardBundle(id: string, b: Partial<InsertCardBundle>): Promise<CardBundle | undefined>;
  deleteCardBundle(id: string): Promise<boolean>;
  upsertCardBundleByKey(b: InsertCardBundle): Promise<CardBundle>;

  listMetricDefinitions(): Promise<MetricDefinition[]>;
  getMetricDefinition(id: string): Promise<MetricDefinition | undefined>;
  getMetricDefinitionByKey(key: string): Promise<MetricDefinition | undefined>;
  createMetricDefinition(m: InsertMetricDefinition): Promise<MetricDefinition>;
  updateMetricDefinition(id: string, m: Partial<InsertMetricDefinition>): Promise<MetricDefinition | undefined>;
  deleteMetricDefinition(id: string): Promise<boolean>;

  listChartConfigs(): Promise<ChartConfig[]>;
  getChartConfig(id: string): Promise<ChartConfig | undefined>;
  createChartConfig(c: InsertChartConfig): Promise<ChartConfig>;
  updateChartConfig(id: string, c: Partial<InsertChartConfig>): Promise<ChartConfig | undefined>;
  deleteChartConfig(id: string): Promise<boolean>;

  listCards(): Promise<Card[]>;
  getCard(id: string): Promise<Card | undefined>;
  createCard(c: InsertCard): Promise<Card>;
  updateCard(id: string, c: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: string): Promise<boolean>;
  getCardWithLatest(id: string): Promise<{ card: Card; bundle?: CardBundle; chartConfig?: ChartConfig; metric?: MetricDefinition; latestData?: CardData; relations: CardRelation[] } | undefined>;

  listCardData(cardId: string): Promise<CardData[]>;
  getLatestCardData(cardId: string): Promise<CardData | undefined>;
  pushCardData(d: InsertCardData): Promise<CardData>;

  listCardRelations(cardId: string): Promise<CardRelation[]>;
  getCardRelation(id: string): Promise<CardRelation | undefined>;
  createCardRelation(r: InsertCardRelation): Promise<CardRelation>;
  deleteCardRelation(id: string): Promise<boolean>;
  getDrilldownCards(cardId: string): Promise<{ relation: CardRelation; card: Card }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async listCardBundles(): Promise<CardBundle[]> {
    return db.select().from(cardBundles).orderBy(cardBundles.category, cardBundles.displayName);
  }

  async getCardBundle(id: string): Promise<CardBundle | undefined> {
    const [b] = await db.select().from(cardBundles).where(eq(cardBundles.id, id));
    return b;
  }

  async getCardBundleByKey(key: string): Promise<CardBundle | undefined> {
    const [b] = await db.select().from(cardBundles).where(eq(cardBundles.key, key));
    return b;
  }

  async createCardBundle(b: InsertCardBundle): Promise<CardBundle> {
    const [result] = await db.insert(cardBundles).values(b).returning();
    return result;
  }

  async updateCardBundle(id: string, b: Partial<InsertCardBundle>): Promise<CardBundle | undefined> {
    const [result] = await db.update(cardBundles).set({ ...b, updatedAt: new Date() }).where(eq(cardBundles.id, id)).returning();
    return result;
  }

  async deleteCardBundle(id: string): Promise<boolean> {
    const result = await db.delete(cardBundles).where(eq(cardBundles.id, id)).returning();
    return result.length > 0;
  }

  async upsertCardBundleByKey(b: InsertCardBundle): Promise<CardBundle> {
    const existing = await this.getCardBundleByKey(b.key);
    if (existing) {
      const updated = await this.updateCardBundle(existing.id, b);
      return updated!;
    }
    return this.createCardBundle(b);
  }

  async listMetricDefinitions(): Promise<MetricDefinition[]> {
    return db.select().from(metricDefinitions).orderBy(metricDefinitions.category, metricDefinitions.name);
  }

  async getMetricDefinition(id: string): Promise<MetricDefinition | undefined> {
    const [m] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.id, id));
    return m;
  }

  async getMetricDefinitionByKey(key: string): Promise<MetricDefinition | undefined> {
    const [m] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.key, key));
    return m;
  }

  async createMetricDefinition(m: InsertMetricDefinition): Promise<MetricDefinition> {
    const [result] = await db.insert(metricDefinitions).values(m).returning();
    return result;
  }

  async updateMetricDefinition(id: string, m: Partial<InsertMetricDefinition>): Promise<MetricDefinition | undefined> {
    const [result] = await db.update(metricDefinitions).set({ ...m, updatedAt: new Date() }).where(eq(metricDefinitions.id, id)).returning();
    return result;
  }

  async deleteMetricDefinition(id: string): Promise<boolean> {
    const result = await db.delete(metricDefinitions).where(eq(metricDefinitions.id, id)).returning();
    return result.length > 0;
  }

  async listChartConfigs(): Promise<ChartConfig[]> {
    return db.select().from(chartConfigs).orderBy(chartConfigs.chartType, chartConfigs.name);
  }

  async getChartConfig(id: string): Promise<ChartConfig | undefined> {
    const [c] = await db.select().from(chartConfigs).where(eq(chartConfigs.id, id));
    return c;
  }

  async createChartConfig(c: InsertChartConfig): Promise<ChartConfig> {
    const [result] = await db.insert(chartConfigs).values(c).returning();
    return result;
  }

  async updateChartConfig(id: string, c: Partial<InsertChartConfig>): Promise<ChartConfig | undefined> {
    const [result] = await db.update(chartConfigs).set({ ...c, updatedAt: new Date() }).where(eq(chartConfigs.id, id)).returning();
    return result;
  }

  async deleteChartConfig(id: string): Promise<boolean> {
    const result = await db.delete(chartConfigs).where(eq(chartConfigs.id, id)).returning();
    return result.length > 0;
  }

  async listCards(): Promise<Card[]> {
    return db.select().from(cards).orderBy(desc(cards.updatedAt));
  }

  async getCard(id: string): Promise<Card | undefined> {
    const [c] = await db.select().from(cards).where(eq(cards.id, id));
    return c;
  }

  async createCard(c: InsertCard): Promise<Card> {
    const [result] = await db.insert(cards).values(c).returning();
    return result;
  }

  async updateCard(id: string, c: Partial<InsertCard>): Promise<Card | undefined> {
    const [result] = await db.update(cards).set({ ...c, updatedAt: new Date() }).where(eq(cards.id, id)).returning();
    return result;
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id)).returning();
    return result.length > 0;
  }

  async getCardWithLatest(id: string) {
    const card = await this.getCard(id);
    if (!card) return undefined;
    const [bundle, chartConfig, metric, latestData, relations] = await Promise.all([
      card.bundleId ? this.getCardBundle(card.bundleId) : Promise.resolve(undefined),
      card.chartConfigId ? this.getChartConfig(card.chartConfigId) : Promise.resolve(undefined),
      card.metricId ? this.getMetricDefinition(card.metricId) : Promise.resolve(undefined),
      this.getLatestCardData(id),
      this.listCardRelations(id),
    ]);
    return { card, bundle, chartConfig, metric, latestData, relations };
  }

  async listCardData(cardId: string): Promise<CardData[]> {
    return db.select().from(cardData).where(eq(cardData.cardId, cardId)).orderBy(desc(cardData.effectiveAt));
  }

  async getLatestCardData(cardId: string): Promise<CardData | undefined> {
    const [d] = await db.select().from(cardData).where(eq(cardData.cardId, cardId)).orderBy(desc(cardData.effectiveAt)).limit(1);
    return d;
  }

  async pushCardData(d: InsertCardData): Promise<CardData> {
    const [result] = await db.insert(cardData).values(d).returning();
    return result;
  }

  async listCardRelations(cardId: string): Promise<CardRelation[]> {
    return db.select().from(cardRelations)
      .where(or(eq(cardRelations.sourceCardId, cardId), eq(cardRelations.targetCardId, cardId)))
      .orderBy(cardRelations.sortOrder);
  }

  async getCardRelation(id: string): Promise<CardRelation | undefined> {
    const [r] = await db.select().from(cardRelations).where(eq(cardRelations.id, id));
    return r;
  }

  async createCardRelation(r: InsertCardRelation): Promise<CardRelation> {
    const [result] = await db.insert(cardRelations).values(r).returning();
    return result;
  }

  async deleteCardRelation(id: string): Promise<boolean> {
    const result = await db.delete(cardRelations).where(eq(cardRelations.id, id)).returning();
    return result.length > 0;
  }

  async getDrilldownCards(cardId: string): Promise<{ relation: CardRelation; card: Card }[]> {
    const rels = await db.select().from(cardRelations)
      .where(and(eq(cardRelations.sourceCardId, cardId), eq(cardRelations.relationType, "drilldown")))
      .orderBy(cardRelations.sortOrder);
    const results: { relation: CardRelation; card: Card }[] = [];
    for (const rel of rels) {
      const card = await this.getCard(rel.targetCardId);
      if (card) results.push({ relation: rel, card });
    }
    return results;
  }
}

export const storage = new DatabaseStorage();
