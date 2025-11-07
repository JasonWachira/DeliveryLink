import { pgTable, text, timestamp, serial, integer, numeric, varchar, date } from "drizzle-orm/pg-core";
import { user } from "./auth";


export const dailyStatistics = pgTable("daily_statistics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),


  totalOrders: integer("total_orders").notNull().default(0),
  completedOrders: integer("completed_orders").notNull().default(0),
  cancelledOrders: integer("cancelled_orders").notNull().default(0),
  failedOrders: integer("failed_orders").notNull().default(0),


  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  platformFees: numeric("platform_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  deliveryFees: numeric("delivery_fees", { precision: 12, scale: 2 }).notNull().default("0"),


  avgDeliveryTime: integer("avg_delivery_time"), // in minutes
  onTimeDeliveryRate: numeric("on_time_delivery_rate", { precision: 5, scale: 2 }), // percentage
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }),


  activeDrivers: integer("active_drivers").notNull().default(0),
  activeBusinesses: integer("active_businesses").notNull().default(0),
  newBusinesses: integer("new_businesses").notNull().default(0),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Business-specific statistics
export const businessStatistics = pgTable("business_statistics", {
  id: serial("id").primaryKey(),
  businessId: text("business_id")
    .references(() => user.id)
    .notNull(),
  date: date("date").notNull(),

  // Order stats
  totalOrders: integer("total_orders").notNull().default(0),
  completedOrders: integer("completed_orders").notNull().default(0),
  cancelledOrders: integer("cancelled_orders").notNull().default(0),

  // Financial
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  avgOrderValue: numeric("avg_order_value", { precision: 10, scale: 2 }),

  // Performance
  avgDeliveryTime: integer("avg_delivery_time"),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Driver performance statistics
export const driverStatistics = pgTable("driver_statistics", {
  id: serial("id").primaryKey(),
  driverId: text("driver_id")
    .references(() => user.id)
    .notNull(),
  date: date("date").notNull(),

  // Delivery stats
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  completedDeliveries: integer("completed_deliveries").notNull().default(0),
  failedDeliveries: integer("failed_deliveries").notNull().default(0),

  // Earnings
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),

  // Performance
  avgDeliveryTime: integer("avg_delivery_time"),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }),
  totalDistanceCovered: numeric("total_distance_covered", { precision: 10, scale: 2 }), // in km

  // Activity
  hoursOnline: numeric("hours_online", { precision: 5, scale: 2 }),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Real-time dashboard snapshot (for quick overview)
export const dashboardSnapshot = pgTable("dashboard_snapshot", {
  id: serial("id").primaryKey(),

  // Current status
  activeOrders: integer("active_orders").notNull().default(0),
  pendingOrders: integer("pending_orders").notNull().default(0),
  driversOnline: integer("drivers_online").notNull().default(0),

  // Today's numbers
  todayOrders: integer("today_orders").notNull().default(0),
  todayRevenue: numeric("today_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  todayCompletions: integer("today_completions").notNull().default(0),

  // This week
  weekOrders: integer("week_orders").notNull().default(0),
  weekRevenue: numeric("week_revenue", { precision: 12, scale: 2 }).notNull().default("0"),

  // This month
  monthOrders: integer("month_orders").notNull().default(0),
  monthRevenue: numeric("month_revenue", { precision: 12, scale: 2 }).notNull().default("0"),

  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
