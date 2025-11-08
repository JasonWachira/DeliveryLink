
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { orders, orderStatusHistory, orderTrackingEvents } from "@deliverylink/db/schema/order";
import { dailyStatistics, businessStatistics, dashboardSnapshot } from "@deliverylink/db/schema/statistics";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `DL-${year}-${random}`;
};

const normalizeKenyanPhone = (phone: string): string => {
  let cleaned = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

  if (cleaned.startsWith('+254')) {
    return cleaned.substring(1);
  }

  if (cleaned.startsWith('254')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }

  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }

  return cleaned;
};

const sendWhatsAppTemplate = async (phone: string, templateName: string, parameters: { type: string; text: string }[]) => {
  try {
    const normalizedPhone = normalizeKenyanPhone(phone);

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: normalizedPhone,
        templateName,
        parameters,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send WhatsApp template:', await response.text());
    }
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
  }
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const updateDailyStatistics = async (tx: any, order: any, isNewOrder: boolean = false) => {
  const today = getTodayDate();

  const [existingStat] = await tx
    .select()
    .from(dailyStatistics)
    .where(eq(dailyStatistics.date, today))
    .limit(1);

  const deliveryFee = parseFloat(order.deliveryFee);
  const platformFee = parseFloat(order.platformFee);
  const totalCost = parseFloat(order.totalCost);
  const packageValue = order.packageValue ? parseFloat(order.packageValue) : 0;

  if (existingStat) {
    const updates: any = {
      updatedAt: new Date(),
    };

    if (isNewOrder) {
      updates.totalOrders = existingStat.totalOrders + 1;
      updates.totalRevenue = (parseFloat(existingStat.totalRevenue) + totalCost).toFixed(2);
      updates.platformFees = (parseFloat(existingStat.platformFees) + platformFee).toFixed(2);
      updates.deliveryFees = (parseFloat(existingStat.deliveryFees) + deliveryFee).toFixed(2);
      updates.totalPackageValue = (parseFloat(existingStat.totalPackageValue) + packageValue).toFixed(2);

      if (order.priority === 'urgent') updates.urgentOrders = existingStat.urgentOrders + 1;
      if (order.priority === 'normal') updates.normalOrders = existingStat.normalOrders + 1;
      if (order.priority === 'scheduled') updates.scheduledOrders = existingStat.scheduledOrders + 1;

      if (order.isFragile) updates.fragilePackages = existingStat.fragilePackages + 1;

      if (order.packageSize === 'small') updates.smallPackages = existingStat.smallPackages + 1;
      if (order.packageSize === 'medium') updates.mediumPackages = existingStat.mediumPackages + 1;
      if (order.packageSize === 'large') updates.largePackages = existingStat.largePackages + 1;
    }

    if (order.status === 'confirmed') updates.confirmedOrders = existingStat.confirmedOrders + 1;
    if (order.status === 'assigned') updates.assignedOrders = existingStat.assignedOrders + 1;
    if (order.status === 'picked_up') updates.pickedUpOrders = existingStat.pickedUpOrders + 1;
    if (order.status === 'in_transit') updates.inTransitOrders = existingStat.inTransitOrders + 1;
    if (order.status === 'delivered') updates.deliveredOrders = existingStat.deliveredOrders + 1;
    if (order.status === 'cancelled') updates.cancelledOrders = existingStat.cancelledOrders + 1;

    await tx
      .update(dailyStatistics)
      .set(updates)
      .where(eq(dailyStatistics.id, existingStat.id));
  } else {
    await tx.insert(dailyStatistics).values({
      date: today,
      totalOrders: 1,
      confirmedOrders: order.status === 'confirmed' ? 1 : 0,
      assignedOrders: order.status === 'assigned' ? 1 : 0,
      pickedUpOrders: order.status === 'picked_up' ? 1 : 0,
      inTransitOrders: order.status === 'in_transit' ? 1 : 0,
      deliveredOrders: order.status === 'delivered' ? 1 : 0,
      cancelledOrders: order.status === 'cancelled' ? 1 : 0,
      totalRevenue: totalCost.toFixed(2),
      platformFees: platformFee.toFixed(2),
      deliveryFees: deliveryFee.toFixed(2),
      urgentOrders: order.priority === 'urgent' ? 1 : 0,
      normalOrders: order.priority === 'normal' ? 1 : 0,
      scheduledOrders: order.priority === 'scheduled' ? 1 : 0,
      fragilePackages: order.isFragile ? 1 : 0,
      smallPackages: order.packageSize === 'small' ? 1 : 0,
      mediumPackages: order.packageSize === 'medium' ? 1 : 0,
      largePackages: order.packageSize === 'large' ? 1 : 0,
      totalPackageValue: packageValue.toFixed(2),
    });
  }
};

const updateBusinessStatistics = async (tx: any, order: any, isNewOrder: boolean = false) => {
  const today = getTodayDate();

  const [existingStat] = await tx
    .select()
    .from(businessStatistics)
    .where(
      and(
        eq(businessStatistics.businessId, order.businessId),
        eq(businessStatistics.date, today)
      )
    )
    .limit(1);

  const deliveryFee = parseFloat(order.deliveryFee);
  const platformFee = parseFloat(order.platformFee);
  const totalCost = parseFloat(order.totalCost);
  const packageValue = order.packageValue ? parseFloat(order.packageValue) : 0;

  if (existingStat) {
    const updates: any = {
      updatedAt: new Date(),
    };

    if (isNewOrder) {
      updates.totalOrders = existingStat.totalOrders + 1;
      updates.totalSpent = (parseFloat(existingStat.totalSpent) + totalCost).toFixed(2);
      updates.totalPlatformFees = (parseFloat(existingStat.totalPlatformFees) + platformFee).toFixed(2);
      updates.totalDeliveryFees = (parseFloat(existingStat.totalDeliveryFees) + deliveryFee).toFixed(2);
      updates.totalPackageValue = (parseFloat(existingStat.totalPackageValue) + packageValue).toFixed(2);

      if (order.priority === 'urgent') updates.urgentOrders = existingStat.urgentOrders + 1;
      if (order.priority === 'normal') updates.normalOrders = existingStat.normalOrders + 1;
      if (order.priority === 'scheduled') updates.scheduledOrders = existingStat.scheduledOrders + 1;

      if (order.isFragile) updates.fragilePackages = existingStat.fragilePackages + 1;

      if (order.packageSize === 'small') updates.smallPackages = existingStat.smallPackages + 1;
      if (order.packageSize === 'medium') updates.mediumPackages = existingStat.mediumPackages + 1;
      if (order.packageSize === 'large') updates.largePackages = existingStat.largePackages + 1;
    }

    if (order.status === 'confirmed') updates.confirmedOrders = existingStat.confirmedOrders + 1;
    if (order.status === 'assigned') updates.assignedOrders = existingStat.assignedOrders + 1;
    if (order.status === 'picked_up') updates.pickedUpOrders = existingStat.pickedUpOrders + 1;
    if (order.status === 'in_transit') updates.inTransitOrders = existingStat.inTransitOrders + 1;
    if (order.status === 'delivered') updates.deliveredOrders = existingStat.deliveredOrders + 1;
    if (order.status === 'cancelled') updates.cancelledOrders = existingStat.cancelledOrders + 1;

    await tx
      .update(businessStatistics)
      .set(updates)
      .where(eq(businessStatistics.id, existingStat.id));
  } else {
    await tx.insert(businessStatistics).values({
      businessId: order.businessId,
      date: today,
      totalOrders: 1,
      confirmedOrders: order.status === 'confirmed' ? 1 : 0,
      assignedOrders: order.status === 'assigned' ? 1 : 0,
      pickedUpOrders: order.status === 'picked_up' ? 1 : 0,
      inTransitOrders: order.status === 'in_transit' ? 1 : 0,
      deliveredOrders: order.status === 'delivered' ? 1 : 0,
      cancelledOrders: order.status === 'cancelled' ? 1 : 0,
      totalSpent: totalCost.toFixed(2),
      totalPlatformFees: platformFee.toFixed(2),
      totalDeliveryFees: deliveryFee.toFixed(2),
      urgentOrders: order.priority === 'urgent' ? 1 : 0,
      normalOrders: order.priority === 'normal' ? 1 : 0,
      scheduledOrders: order.priority === 'scheduled' ? 1 : 0,
      fragilePackages: order.isFragile ? 1 : 0,
      smallPackages: order.packageSize === 'small' ? 1 : 0,
      mediumPackages: order.packageSize === 'medium' ? 1 : 0,
      largePackages: order.packageSize === 'large' ? 1 : 0,
      totalPackageValue: packageValue.toFixed(2),
    });
  }
};

const updateDashboardSnapshot = async (tx: any) => {
  const today = getTodayDate();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const allOrders = await tx
    .select()
    .from(orders)
    .where(eq(orders.deletedAt, null));

  const activeOrders = allOrders.filter(o =>
    ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit'].includes(o.status)
  ).length;

  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
  const confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length;
  const assignedOrders = allOrders.filter(o => o.status === 'assigned').length;
  const pickedUpOrders = allOrders.filter(o => o.status === 'picked_up').length;
  const inTransitOrders = allOrders.filter(o => o.status === 'in_transit').length;

  const todayOrders = allOrders.filter(o => {
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.totalCost), 0);
  const todayPlatformFees = todayOrders.reduce((sum, o) => sum + parseFloat(o.platformFee), 0);
  const todayDeliveryFees = todayOrders.reduce((sum, o) => sum + parseFloat(o.deliveryFee), 0);
  const todayDelivered = todayOrders.filter(o => o.status === 'delivered').length;
  const todayCancelled = todayOrders.filter(o => o.status === 'cancelled').length;

  const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekAgo);
  const weekRevenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.totalCost), 0);
  const weekDelivered = weekOrders.filter(o => o.status === 'delivered').length;

  const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthAgo);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.totalCost), 0);
  const monthDelivered = monthOrders.filter(o => o.status === 'delivered').length;

  const [existingSnapshot] = await tx
    .select()
    .from(dashboardSnapshot)
    .limit(1);

  if (existingSnapshot) {
    await tx
      .update(dashboardSnapshot)
      .set({
        activeOrders,
        pendingOrders,
        confirmedOrders,
        assignedOrders,
        pickedUpOrders,
        inTransitOrders,
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue.toFixed(2),
        todayPlatformFees: todayPlatformFees.toFixed(2),
        todayDeliveryFees: todayDeliveryFees.toFixed(2),
        todayDelivered,
        todayCancelled,
        weekOrders: weekOrders.length,
        weekRevenue: weekRevenue.toFixed(2),
        weekDelivered,
        monthOrders: monthOrders.length,
        monthRevenue: monthRevenue.toFixed(2),
        monthDelivered,
        lastUpdated: new Date(),
      })
      .where(eq(dashboardSnapshot.id, existingSnapshot.id));
  } else {
    await tx.insert(dashboardSnapshot).values({
      activeOrders,
      pendingOrders,
      confirmedOrders,
      assignedOrders,
      pickedUpOrders,
      inTransitOrders,
      todayOrders: todayOrders.length,
      todayRevenue: todayRevenue.toFixed(2),
      todayPlatformFees: todayPlatformFees.toFixed(2),
      todayDeliveryFees: todayDeliveryFees.toFixed(2),
      todayDelivered,
      todayCancelled,
      weekOrders: weekOrders.length,
      weekRevenue: weekRevenue.toFixed(2),
      weekDelivered,
      monthOrders: monthOrders.length,
      monthRevenue: monthRevenue.toFixed(2),
      monthDelivered,
    });
  }
};

export const orderRouter = router({
  placeOrder: protectedProcedure
      .input(z.object({
        pickupContactName: z.string().min(1).max(255),
        pickupContactPhone: z.string().min(1).max(20),
        pickupAddress: z.string().min(1),
        pickupLatitude: z.number(),
        pickupLongitude: z.number(),
        pickupInstructions: z.string().optional(),
        dropoffContactName: z.string().min(1).max(255),
        dropoffContactPhone: z.string().min(1).max(20),
        dropoffAddress: z.string().min(1),
        dropoffLatitude: z.number(),
        dropoffLongitude: z.number(),
        dropoffInstructions: z.string().optional(),
        packageDescription: z.string().min(1),
        packageWeight: z.number().positive().optional(),
        packageSize: z.enum(['small', 'medium', 'large']).optional(),
        packageQuantity: z.number().int().positive().default(1),
        packageValue: z.number().positive().optional(),
        priority: z.enum(['urgent', 'normal', 'scheduled']).default('normal'),
        isFragile: z.boolean().default(false),
        scheduledPickupTime: z.date().optional(),
        distanceInKm: z.number().positive(),
        estimatedTimeInMinutes: z.number().positive()
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.transaction(async (tx) => {
          const orderNumber = generateOrderNumber();

          const baseFee = 100;
          const perKmRate = 20;
          const urgentMultiplier = 1.5;

          let deliveryFee = baseFee + (input.distanceInKm * perKmRate);

          if (input.priority === 'urgent') {
            deliveryFee = deliveryFee * urgentMultiplier;
          }

          deliveryFee = Math.round(deliveryFee);

          const platformFee = deliveryFee * 0.15;
          const totalCost = deliveryFee + platformFee;

          const [newOrder] = await tx
            .insert(orders)
            .values({
              orderNumber,
              customerId: ctx.session.user.id,
              businessId: ctx.session.user.id,
              status: 'confirmed',
              pickupContactName: input.pickupContactName,
              pickupContactPhone: input.pickupContactPhone,
              pickupAddress: input.pickupAddress,
              pickupLatitude: input.pickupLatitude.toString(),
              pickupLongitude: input.pickupLongitude.toString(),
              pickupInstructions: input.pickupInstructions,
              dropoffContactName: input.dropoffContactName,
              dropoffContactPhone: input.dropoffContactPhone,
              dropoffAddress: input.dropoffAddress,
              dropoffLatitude: input.dropoffLatitude.toString(),
              dropoffLongitude: input.dropoffLongitude.toString(),
              dropoffInstructions: input.dropoffInstructions,
              packageDescription: input.packageDescription,
              packageWeight: input.packageWeight?.toString(),
              packageSize: input.packageSize,
              packageQuantity: input.packageQuantity,
              packageValue: input.packageValue?.toString(),
              deliveryFee: deliveryFee.toString(),
              platformFee: platformFee.toString(),
              totalCost: totalCost.toString(),
              estimatedDistance: input.distanceInKm,
              actualDistance:input.distanceInKm,
              priority: input.priority,
              isFragile: input.isFragile,
              scheduledPickupTime: input.scheduledPickupTime,
              estimatedDuration: input.estimatedTimeInMinutes
            })
            .returning();

          if (!newOrder) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create order"
            });
          }

          await tx.insert(orderStatusHistory).values({
            orderId: newOrder.orderId,
            status: 'confirmed',
            changedBy: ctx.session.user.id,
            notes: 'Order created',
          });

          await tx.insert(orderTrackingEvents).values({
            orderId: newOrder.orderId,
            eventType: 'order_created',
            eventData: { orderNumber },
          });

          await updateDailyStatistics(tx, newOrder, true);
          await updateBusinessStatistics(tx, newOrder, true);
          await updateDashboardSnapshot(tx);

          const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${newOrder.orderId}`;

          await sendWhatsAppTemplate(
            input.dropoffContactPhone,
            'deliverytracking',
            [
              { type: 'text', text: input.dropoffContactName },
              { type: 'text', text: 'confirmed' },
              { type: 'text', text: 'pending pickup' },
              { type: 'text', text: `${input.pickupAddress} to ${input.dropoffAddress}` },
              { type: 'text', text: trackingUrl }
            ]
          );

          return {
            success: true,
            order: newOrder,
            orderNumber: newOrder.orderNumber
          };
        });
      }),

  getMyOrders: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(orders.customerId, ctx.session.user.id),
      ];

      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      const userOrders = await ctx.db
        .select()
        .from(orders)
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(...conditions));

      return {
        orders: userOrders,
        total: total[0]?.count || 0,
      };
    }),

  getOrderById: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderId, input.orderId),
            eq(orders.customerId, ctx.session.user.id),
          )
        )
        .limit(1);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  getOrderByNumber: protectedProcedure
    .input(z.object({
      orderNumber: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderNumber, input.orderNumber),
          )
        )
        .limit(1);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  getOrderStatusHistory: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderId, input.orderId),
            eq(orders.customerId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const history = await ctx.db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, input.orderId))
        .orderBy(desc(orderStatusHistory.changedAt));

      return history;
    }),

  getOrderTrackingEvents: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderId, input.orderId),
            eq(orders.customerId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const events = await ctx.db
        .select()
        .from(orderTrackingEvents)
        .where(eq(orderTrackingEvents.orderId, input.orderId))
        .orderBy(desc(orderTrackingEvents.timestamp));

      return events;
    }),

  cancelOrder: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.customerId, ctx.session.user.id),
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (!['pending', 'confirmed', 'assigned'].includes(order.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order cannot be cancelled at this stage",
          });
        }

        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: 'cancelled',
            cancelledAt: new Date(),
          })
          .where(eq(orders.orderId, input.orderId))
          .returning();

        await tx.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: 'cancelled',
          changedBy: ctx.session.user.id,
          notes: input.reason,
        });

        await tx.insert(orderTrackingEvents).values({
          orderId: input.orderId,
          eventType: 'order_cancelled',
          eventData: { reason: input.reason },
        });

        await updateDailyStatistics(tx, updatedOrder, false);
        await updateBusinessStatistics(tx, updatedOrder, false);
        await updateDashboardSnapshot(tx);

        const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderId}`;

        await sendWhatsAppTemplate(
          order.dropoffContactPhone,
          'deliverytracking',
          [
            { type: 'text', text: order.dropoffContactName },
            { type: 'text', text: 'cancelled' },
            { type: 'text', text: 'cancelled' },
            { type: 'text', text: `${order.pickupAddress} to ${order.dropoffAddress}` },
            { type: 'text', text: trackingUrl }
          ]
        );

        return { success: true, order: updatedOrder };
      });
    }),

  getOrderStats: protectedProcedure
    .query(async ({ ctx }) => {
      const allOrders = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.customerId, ctx.session.user.id),
          )
        );

      const total = allOrders.length;
      const completed = allOrders.filter(o => o.status === 'delivered').length;
      const cancelled = allOrders.filter(o => o.status === 'cancelled').length;
      const active = allOrders.filter(o => ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit'].includes(o.status)).length;

      const totalSpent = allOrders
        .reduce((sum, o) => sum + parseFloat(o.totalCost), 0);

      return {
        total,
        completed,
        cancelled,
        active,
        totalSpent: totalSpent.toFixed(2),
              };
            }),
        });
