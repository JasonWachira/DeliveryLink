import { pgTable, text, timestamp, serial, integer, numeric, date, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const dailyStatistics = pgTable("daily_statistics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalOrders: integer("total_orders").notNull().default(0),
  confirmedOrders: integer("confirmed_orders").notNull().default(0),
  assignedOrders: integer("assigned_orders").notNull().default(0),
  pickedUpOrders: integer("picked_up_orders").notNull().default(0),
  inTransitOrders: integer("in_transit_orders").notNull().default(0),
  deliveredOrders: integer("delivered_orders").notNull().default(0),
  cancelledOrders: integer("cancelled_orders").notNull().default(0),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  platformFees: numeric("platform_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  deliveryFees: numeric("delivery_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  urgentOrders: integer("urgent_orders").notNull().default(0),
  normalOrders: integer("normal_orders").notNull().default(0),
  scheduledOrders: integer("scheduled_orders").notNull().default(0),
  fragilePackages: integer("fragile_packages").notNull().default(0),
  smallPackages: integer("small_packages").notNull().default(0),
  mediumPackages: integer("medium_packages").notNull().default(0),
  largePackages: integer("large_packages").notNull().default(0),
  totalPackageValue: numeric("total_package_value", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessStatistics = pgTable("business_statistics", {
  id: serial("id").primaryKey(),
  businessId: text("business_id")
    .references(() => user.id)
    .notNull(),
  date: date("date").notNull(),
  totalOrders: integer("total_orders").notNull().default(0),
  confirmedOrders: integer("confirmed_orders").notNull().default(0),
  assignedOrders: integer("assigned_orders").notNull().default(0),
  pickedUpOrders: integer("picked_up_orders").notNull().default(0),
  inTransitOrders: integer("in_transit_orders").notNull().default(0),
  deliveredOrders: integer("delivered_orders").notNull().default(0),
  cancelledOrders: integer("cancelled_orders").notNull().default(0),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  totalPlatformFees: numeric("total_platform_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  totalDeliveryFees: numeric("total_delivery_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  urgentOrders: integer("urgent_orders").notNull().default(0),
  normalOrders: integer("normal_orders").notNull().default(0),
  scheduledOrders: integer("scheduled_orders").notNull().default(0),
  fragilePackages: integer("fragile_packages").notNull().default(0),
  smallPackages: integer("small_packages").notNull().default(0),
  mediumPackages: integer("medium_packages").notNull().default(0),
  largePackages: integer("large_packages").notNull().default(0),
  totalPackageValue: numeric("total_package_value", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessDateIdx: uniqueIndex("business_date_idx").on(table.businessId, table.date),
}));

export const driverStatistics = pgTable("driver_statistics", {
  id: serial("id").primaryKey(),
  driverId: text("driver_id")
    .references(() => user.id)
    .notNull(),
  date: date("date").notNull(),
  totalAssignedOrders: integer("total_assigned_orders").notNull().default(0),
  totalPickedUpOrders: integer("total_picked_up_orders").notNull().default(0),
  totalInTransitOrders: integer("total_in_transit_orders").notNull().default(0),
  totalDeliveredOrders: integer("total_delivered_orders").notNull().default(0),
  totalCancelledOrders: integer("total_cancelled_orders").notNull().default(0),
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  urgentDeliveries: integer("urgent_deliveries").notNull().default(0),
  normalDeliveries: integer("normal_deliveries").notNull().default(0),
  scheduledDeliveries: integer("scheduled_deliveries").notNull().default(0),
  fragilePackagesHandled: integer("fragile_packages_handled").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  driverDateIdx: uniqueIndex("driver_date_idx").on(table.driverId, table.date),
}));

export const dashboardSnapshot = pgTable("dashboard_snapshot", {
  id: serial("id").primaryKey(),
  activeOrders: integer("active_orders").notNull().default(0),
  pendingOrders: integer("pending_orders").notNull().default(0),
  confirmedOrders: integer("confirmed_orders").notNull().default(0),
  assignedOrders: integer("assigned_orders").notNull().default(0),
  pickedUpOrders: integer("picked_up_orders").notNull().default(0),
  inTransitOrders: integer("in_transit_orders").notNull().default(0),
  todayOrders: integer("today_orders").notNull().default(0),
  todayRevenue: numeric("today_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  todayPlatformFees: numeric("today_platform_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  todayDeliveryFees: numeric("today_delivery_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  todayDelivered: integer("today_delivered").notNull().default(0),
  todayCancelled: integer("today_cancelled").notNull().default(0),
  weekOrders: integer("week_orders").notNull().default(0),
  weekRevenue: numeric("week_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  weekDelivered: integer("week_delivered").notNull().default(0),
  monthOrders: integer("month_orders").notNull().default(0),
  monthRevenue: numeric("month_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  monthDelivered: integer("month_delivered").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
