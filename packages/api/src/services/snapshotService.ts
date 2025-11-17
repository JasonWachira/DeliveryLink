/* eslint-disable */
// @ts-nocheck
import { db } from "@deliverylink/db";
import { dashboardSnapshot, orders } from "@deliverylink/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export async function updateDashboardSnapshot() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();


  const activeOrdersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      sql`${orders.status} NOT IN ('delivered', 'cancelled')`
    );


  const pendingOrdersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'pending'));


  const todayOrdersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(gte(orders.createdAt, new Date(today)));

  const todayDeliveredResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, 'delivered'),
        gte(orders.createdAt, new Date(today))
      )
    );


  const todayRevenueResult = await db
    .select({
      revenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      fees: sql<string>`COALESCE(SUM(${orders.platformFee}), 0)`
    })
    .from(orders)
    .where(gte(orders.createdAt, new Date(today)));

  const snapshotData = {
    activeOrders: Number(activeOrdersResult[0]?.count || 0),
    pendingOrders: Number(pendingOrdersResult[0]?.count || 0),
    todayOrders: Number(todayOrdersResult[0]?.count || 0),
    todayDelivered: Number(todayDeliveredResult[0]?.count || 0),
    todayRevenue: todayRevenueResult[0]?.revenue || "0.00",
    todayPlatformFees: todayRevenueResult[0]?.fees || "0.00",
    updatedAt: now,
  };

  const [existingSnapshot] = await db
    .select()
    .from(dashboardSnapshot)
    .limit(1);

  if (existingSnapshot) {
    await db
      .update(dashboardSnapshot)
      .set(snapshotData)
      .where(eq(dashboardSnapshot.id, existingSnapshot.id));
  } else {
    await db
      .insert(dashboardSnapshot)
      .values({
        id: crypto.randomUUID(),
        ...snapshotData,
        createdAt: now,
      });
  }

  return snapshotData;
}
