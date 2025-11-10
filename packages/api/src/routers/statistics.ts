
import { z } from "zod";
import { router, protectedProcedure} from "../index";
import { dailyStatistics, businessStatistics, driverStatistics, dashboardSnapshot } from "@deliverylink/db/schema/statistics";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { orders } from "@deliverylink/db/schema/order";

export const statisticsRouter = router({
  getDashboardSnapshot: protectedProcedure
    .query(async ({ ctx }) => {
      const today = new Date().toISOString().split('T')[0];

      const activeOrdersResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          sql`${orders.status} NOT IN ('delivered', 'cancelled')`
        );

      const pendingOrdersResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.status, 'pending'));

      const todayOrdersResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(gte(orders.createdAt, new Date(today)));

      const todayDeliveredResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.status, 'delivered'),
            gte(orders.createdAt, new Date(today))
          )
        );

      const todayRevenueResult = await ctx.db
        .select({
          revenue: sql<string>`COALESCE(SUM(${orders.totalCost}), 0)`,
          fees: sql<string>`COALESCE(SUM(${orders.platformFee}), 0)`
        })
        .from(orders)
        .where(gte(orders.createdAt, new Date(today)));

      return {
        activeOrders: Number(activeOrdersResult[0]?.count || 0),
        pendingOrders: Number(pendingOrdersResult[0]?.count || 0),
        todayOrders: Number(todayOrdersResult[0]?.count || 0),
        todayDelivered: Number(todayDeliveredResult[0]?.count || 0),
        todayRevenue: todayRevenueResult[0]?.revenue || "0.00",
        todayPlatformFees: todayRevenueResult[0]?.fees || "0.00",
      };
    }),

  getDailyStatistics: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db
        .select()
        .from(dailyStatistics)
        .where(
          and(
            gte(dailyStatistics.date, input.startDate),
            lte(dailyStatistics.date, input.endDate)
          )
        )
        .orderBy(desc(dailyStatistics.date));

      return stats;
    }),

  getBusinessStatistics: protectedProcedure
    .input(z.object({
      businessId: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const businessId = input.businessId || ctx.session.user.id;

      const stats = await ctx.db
        .select()
        .from(businessStatistics)
        .where(
          and(
            eq(businessStatistics.businessId, businessId),
            gte(businessStatistics.date, input.startDate),
            lte(businessStatistics.date, input.endDate)
          )
        )
        .orderBy(desc(businessStatistics.date));

      return stats;
    }),

  getDriverStatistics: protectedProcedure
    .input(z.object({
      driverId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db
        .select()
        .from(driverStatistics)
        .where(
          and(
            eq(driverStatistics.driverId, input.driverId),
            gte(driverStatistics.date, input.startDate),
            lte(driverStatistics.date, input.endDate)
          ))
                  .orderBy(desc(driverStatistics.date));

                return stats;
              }),

            getMyBusinessStatistics: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(businessStatistics)
                  .where(
                    and(
                      eq(businessStatistics.businessId, ctx.session.user.id),
                      gte(businessStatistics.date, input.startDate),
                      lte(businessStatistics.date, input.endDate)
                    )
                  )
                  .orderBy(desc(businessStatistics.date));

                return stats;
              }),

            getMyDriverStatistics: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(driverStatistics)
                  .where(
                    and(
                      eq(driverStatistics.driverId, ctx.session.user.id),
                      gte(driverStatistics.date, input.startDate),
                      lte(driverStatistics.date, input.endDate)
                    )
                  )
                  .orderBy(desc(driverStatistics.date));

                return stats;
              }),

            getTodayStatistics: protectedProcedure
              .query(async ({ ctx }) => {
                const today = new Date().toISOString().split('T')[0];

                const [dailyStat] = await ctx.db
                  .select()
                  .from(dailyStatistics)
                  .where(eq(dailyStatistics.date, today))
                  .limit(1);

                return dailyStat || null;
              }),

            getBusinessTodayStatistics: protectedProcedure
              .query(async ({ ctx }) => {
                const today = new Date().toISOString().split('T')[0];

                const [businessStat] = await ctx.db
                  .select()
                  .from(businessStatistics)
                  .where(
                    and(
                      eq(businessStatistics.businessId, ctx.session.user.id),
                      eq(businessStatistics.date, today)
                    )
                  )
                  .limit(1);

                return businessStat || null;
              }),

            getDriverTodayStatistics: protectedProcedure
              .query(async ({ ctx }) => {
                const today = new Date().toISOString().split('T')[0];

                const [driverStat] = await ctx.db
                  .select()
                  .from(driverStatistics)
                  .where(
                    and(
                      eq(driverStatistics.driverId, ctx.session.user.id),
                      eq(driverStatistics.date, today)
                    )
                  )
                  .limit(1);

                return driverStat || null;
              }),

            getBusinessAggregateStatistics: protectedProcedure
              .input(z.object({
                businessId: z.string().optional(),
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const businessId = input.businessId || ctx.session.user.id;

                const stats = await ctx.db
                  .select()
                  .from(businessStatistics)
                  .where(
                    and(
                      eq(businessStatistics.businessId, businessId),
                      gte(businessStatistics.date, input.startDate),
                      lte(businessStatistics.date, input.endDate)
                    )
                  );

                const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);
                const totalDelivered = stats.reduce((sum, s) => sum + s.deliveredOrders, 0);
                const totalCancelled = stats.reduce((sum, s) => sum + s.cancelledOrders, 0);
                const totalSpent = stats.reduce((sum, s) => sum + parseFloat(s.totalSpent), 0);
                const totalPlatformFees = stats.reduce((sum, s) => sum + parseFloat(s.totalPlatformFees), 0);
                const totalDeliveryFees = stats.reduce((sum, s) => sum + parseFloat(s.totalDeliveryFees), 0);
                const urgentOrders = stats.reduce((sum, s) => sum + s.urgentOrders, 0);
                const normalOrders = stats.reduce((sum, s) => sum + s.normalOrders, 0);
                const scheduledOrders = stats.reduce((sum, s) => sum + s.scheduledOrders, 0);
                const fragilePackages = stats.reduce((sum, s) => sum + s.fragilePackages, 0);
                const smallPackages = stats.reduce((sum, s) => sum + s.smallPackages, 0);
                const mediumPackages = stats.reduce((sum, s) => sum + s.mediumPackages, 0);
                const largePackages = stats.reduce((sum, s) => sum + s.largePackages, 0);
                const totalPackageValue = stats.reduce((sum, s) => sum + parseFloat(s.totalPackageValue), 0);

                return {
                  totalOrders,
                  totalDelivered,
                  totalCancelled,
                  totalSpent: totalSpent.toFixed(2),
                  totalPlatformFees: totalPlatformFees.toFixed(2),
                  totalDeliveryFees: totalDeliveryFees.toFixed(2),
                  urgentOrders,
                  normalOrders,
                  scheduledOrders,
                  fragilePackages,
                  smallPackages,
                  mediumPackages,
                  largePackages,
                  totalPackageValue: totalPackageValue.toFixed(2),
                  avgOrderValue: totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : "0.00",
                  deliveryRate: totalOrders > 0 ? ((totalDelivered / totalOrders) * 100).toFixed(2) : "0.00",
                  cancellationRate: totalOrders > 0 ? ((totalCancelled / totalOrders) * 100).toFixed(2) : "0.00",
                };
              }),

            getDriverAggregateStatistics: protectedProcedure
              .input(z.object({
                driverId: z.string(),
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(driverStatistics)
                  .where(
                    and(
                      eq(driverStatistics.driverId, input.driverId),
                      gte(driverStatistics.date, input.startDate),
                      lte(driverStatistics.date, input.endDate)
                    )
                  );

                const totalAssigned = stats.reduce((sum, s) => sum + s.totalAssignedOrders, 0);
                const totalDelivered = stats.reduce((sum, s) => sum + s.totalDeliveredOrders, 0);
                const totalCancelled = stats.reduce((sum, s) => sum + s.totalCancelledOrders, 0);
                const totalEarnings = stats.reduce((sum, s) => sum + parseFloat(s.totalEarnings), 0);
                const urgentDeliveries = stats.reduce((sum, s) => sum + s.urgentDeliveries, 0);
                const normalDeliveries = stats.reduce((sum, s) => sum + s.normalDeliveries, 0);
                const scheduledDeliveries = stats.reduce((sum, s) => sum + s.scheduledDeliveries, 0);
                const fragilePackages = stats.reduce((sum, s) => sum + s.fragilePackagesHandled, 0);

                return {
                  totalAssigned,
                  totalDelivered,
                  totalCancelled,
                  totalEarnings: totalEarnings.toFixed(2),
                  urgentDeliveries,
                  normalDeliveries,
                  scheduledDeliveries,
                  fragilePackages,
                  completionRate: totalAssigned > 0 ? ((totalDelivered / totalAssigned) * 100).toFixed(2) : "0.00",
                  cancellationRate: totalAssigned > 0 ? ((totalCancelled / totalAssigned) * 100).toFixed(2) : "0.00",
                  avgEarningsPerDelivery: totalDelivered > 0 ? (totalEarnings / totalDelivered).toFixed(2) : "0.00",
                };
              }),

            getDailyAggregateStatistics: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(dailyStatistics)
                  .where(
                    and(
                      gte(dailyStatistics.date, input.startDate),
                      lte(dailyStatistics.date, input.endDate)
                    )
                  );

                const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);
                const totalDelivered = stats.reduce((sum, s) => sum + s.deliveredOrders, 0);
                const totalCancelled = stats.reduce((sum, s) => sum + s.cancelledOrders, 0);
                const totalRevenue = stats.reduce((sum, s) => sum + parseFloat(s.totalRevenue), 0);
                const totalPlatformFees = stats.reduce((sum, s) => sum + parseFloat(s.platformFees), 0);
                const totalDeliveryFees = stats.reduce((sum, s) => sum + parseFloat(s.deliveryFees), 0);
                const urgentOrders = stats.reduce((sum, s) => sum + s.urgentOrders, 0);
                const normalOrders = stats.reduce((sum, s) => sum + s.normalOrders, 0);
                const scheduledOrders = stats.reduce((sum, s) => sum + s.scheduledOrders, 0);
                const fragilePackages = stats.reduce((sum, s) => sum + s.fragilePackages, 0);
                const smallPackages = stats.reduce((sum, s) => sum + s.smallPackages, 0);
                const mediumPackages = stats.reduce((sum, s) => sum + s.mediumPackages, 0);
                const largePackages = stats.reduce((sum, s) => sum + s.largePackages, 0);
                const totalPackageValue = stats.reduce((sum, s) => sum + parseFloat(s.totalPackageValue), 0);

                return {
                  totalOrders,
                  totalDelivered,
                  totalCancelled,
                  totalRevenue: totalRevenue.toFixed(2),
                  totalPlatformFees: totalPlatformFees.toFixed(2),
                  totalDeliveryFees: totalDeliveryFees.toFixed(2),
                  urgentOrders,
                  normalOrders,
                  scheduledOrders,
                  fragilePackages,
                  smallPackages,
                  mediumPackages,
                  largePackages,
                  totalPackageValue: totalPackageValue.toFixed(2),
                  avgRevenuePerDay: stats.length > 0 ? (totalRevenue / stats.length).toFixed(2) : "0.00",
                  avgOrdersPerDay: stats.length > 0 ? (totalOrders / stats.length).toFixed(2) : "0.00",
                  deliveryRate: totalOrders > 0 ? ((totalDelivered / totalOrders) * 100).toFixed(2) : "0.00",
                  cancellationRate: totalOrders > 0 ? ((totalCancelled / totalOrders) * 100).toFixed(2) : "0.00",
                };
              }),

            getTopBusinesses: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
                limit: z.number().int().min(1).max(100).default(10),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select({
                    businessId: businessStatistics.businessId,
                    totalOrders: sql<number>`SUM(${businessStatistics.totalOrders})`,
                    totalSpent: sql<string>`SUM(${businessStatistics.totalSpent})`,
                    totalDelivered: sql<number>`SUM(${businessStatistics.deliveredOrders})`,
                  })
                  .from(businessStatistics)
                  .where(
                    and(
                      gte(businessStatistics.date, input.startDate),
                      lte(businessStatistics.date, input.endDate)
                    )
                  )
                  .groupBy(businessStatistics.businessId)
                  .orderBy(desc(sql`SUM(${businessStatistics.totalOrders})`))
                  .limit(input.limit);

                return stats;
              }),

            getTopDrivers: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
                limit: z.number().int().min(1).max(100).default(10),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select({
                    driverId: driverStatistics.driverId,
                    totalDeliveries: sql<number>`SUM(${driverStatistics.totalDeliveredOrders})`,
                    totalEarnings: sql<string>`SUM(${driverStatistics.totalEarnings})`,
                    totalAssigned: sql<number>`SUM(${driverStatistics.totalAssignedOrders})`,
                  })
                  .from(driverStatistics)
                  .where(
                    and(
                      gte(driverStatistics.date, input.startDate),
                      lte(driverStatistics.date, input.endDate)
                    )
                  )
                  .groupBy(driverStatistics.driverId)
                  .orderBy(desc(sql`SUM(${driverStatistics.totalDeliveredOrders})`))
                  .limit(input.limit);

                return stats;
              }),

            getOrderDistributionByPriority: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(dailyStatistics)
                  .where(
                    and(
                      gte(dailyStatistics.date, input.startDate),
                      lte(dailyStatistics.date, input.endDate)
                    )
                  );

                const urgent = stats.reduce((sum, s) => sum + s.urgentOrders, 0);
                const normal = stats.reduce((sum, s) => sum + s.normalOrders, 0);
                const scheduled = stats.reduce((sum, s) => sum + s.scheduledOrders, 0);
                const total = urgent + normal + scheduled;

                return {
                  urgent,
                  normal,
                  scheduled,
                  total,
                  urgentPercentage: total > 0 ? ((urgent / total) * 100).toFixed(2) : "0.00",
                  normalPercentage: total > 0 ? ((normal / total) * 100).toFixed(2) : "0.00",
                  scheduledPercentage: total > 0 ? ((scheduled / total) * 100).toFixed(2) : "0.00",
                };
              }),

            getOrderDistributionBySize: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(dailyStatistics)
                  .where(
                    and(
                      gte(dailyStatistics.date, input.startDate),
                      lte(dailyStatistics.date, input.endDate)
                    )
                  );

                const small = stats.reduce((sum, s) => sum + s.smallPackages, 0);
                const medium = stats.reduce((sum, s) => sum + s.mediumPackages, 0);
                const large = stats.reduce((sum, s) => sum + s.largePackages, 0);
                const total = small + medium + large;

                return {
                  small,
                  medium,
                  large,
                  total,
                  smallPercentage: total > 0 ? ((small / total) * 100).toFixed(2) : "0.00",
                  mediumPercentage: total > 0 ? ((medium / total) * 100).toFixed(2) : "0.00",
                  largePercentage: total > 0 ? ((large / total) * 100).toFixed(2) : "0.00",
                };
              }),

            getRevenueBreakdown: protectedProcedure
              .input(z.object({
                startDate: z.string(),
                endDate: z.string(),
              }))
              .query(async ({ ctx, input }) => {
                const stats = await ctx.db
                  .select()
                  .from(dailyStatistics)
                  .where(
                    and(
                      gte(dailyStatistics.date, input.startDate),
                      lte(dailyStatistics.date, input.endDate)
                    )
                  );

                const totalRevenue = stats.reduce((sum, s) => sum + parseFloat(s.totalRevenue), 0);
                const platformFees = stats.reduce((sum, s) => sum + parseFloat(s.platformFees), 0);
                const deliveryFees = stats.reduce((sum, s) => sum + parseFloat(s.deliveryFees), 0);

                return {
                  totalRevenue: totalRevenue.toFixed(2),
                  platformFees: platformFees.toFixed(2),
                  deliveryFees: deliveryFees.toFixed(2),
                  platformFeePercentage: totalRevenue > 0 ? ((platformFees / totalRevenue) * 100).toFixed(2) : "0.00",
                  deliveryFeePercentage: totalRevenue > 0 ? ((deliveryFees / totalRevenue) * 100).toFixed(2) : "0.00",
                };
              }),
          });
