
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { orders, orderStatusHistory, orderTrackingEvents, otpCode } from "@deliverylink/db/schema/order";
import { dailyStatistics, businessStatistics, dashboardSnapshot } from "@deliverylink/db/schema/statistics";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, isNull, inArray } from "drizzle-orm";

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
    .where(isNull(orders.deletedAt));

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

export const driverRouter = router({

  getAvailableOrders: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {

      const activeDriverOrders = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.driverId, ctx.session.user.id),
            inArray(orders.status, ['assigned', 'picked_up', 'in_transit']),
            isNull(orders.deletedAt)
          )
        );


      const hasActiveDelivery = activeDriverOrders.length > 0;


      const availableOrders = await ctx.db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.status, 'confirmed'),
            isNull(orders.driverId),
            isNull(orders.deletedAt)
          )
        )
        .orderBy(desc(orders.priority), desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.status, 'confirmed'),
            isNull(orders.driverId),
            isNull(orders.deletedAt)
          )
        );

      return {
        hasActiveDelivery,
        activeDelivery: activeDriverOrders[0] || null,
        canAcceptOrders: !hasActiveDelivery,
        availableOrders: hasActiveDelivery ? [] : availableOrders,
        total: total[0]?.count || 0,
      };
    }),


  acceptOrder: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {

        const activeDriverOrders = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.driverId, ctx.session.user.id),
              inArray(orders.status, ['assigned', 'picked_up', 'in_transit']),
              isNull(orders.deletedAt)
            )
          );

        if (activeDriverOrders.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You must complete your current delivery before accepting a new order",
          });
        }


        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.status, 'confirmed'),
              isNull(orders.driverId),
              isNull(orders.deletedAt)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found or already assigned to another driver",
          });
        }


        const [updatedOrder] = await tx
          .update(orders)
          .set({
            driverId: ctx.session.user.id,
            status: 'assigned',
            assignedAt: new Date(),
          })
          .where(eq(orders.orderId, input.orderId))
          .returning();

        await tx.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: 'assigned',
          changedBy: ctx.session.user.id,
          notes: 'Order assigned to driver',
        });

        await tx.insert(orderTrackingEvents).values({
          orderId: input.orderId,
          eventType: 'order_assigned',
          eventData: { driverId: ctx.session.user.id },
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
            { type: 'text', text: 'assigned' },
            { type: 'text', text: 'driver assigned' },
            { type: 'text', text: `${order.pickupAddress} to ${order.dropoffAddress}` },
            { type: 'text', text: trackingUrl }
          ]
        );

        return {
          success: true,
          order: updatedOrder,
        };
      });
    }),


  getMyAssignedOrders: protectedProcedure
    .input(z.object({
      status: z.enum(['assigned', 'picked_up', 'in_transit', 'delivered', 'all']).default('all'),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(orders.driverId, ctx.session.user.id),
        isNull(orders.deletedAt),
      ];

      if (input.status !== 'all') {
        conditions.push(eq(orders.status, input.status));
      }

      const driverOrders = await ctx.db
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
        orders: driverOrders,
        total: total[0]?.count || 0,
      };
    }),


  markAsPickedUp: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
      pickupNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.driverId, ctx.session.user.id),
              eq(orders.status, 'assigned'),
              isNull(orders.deletedAt)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found or not in correct status",
          });
        }

        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: 'picked_up',
            pickedUpAt: new Date(),
          })
          .where(eq(orders.orderId, input.orderId))
          .returning();

        await tx.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: 'picked_up',
          changedBy: ctx.session.user.id,
          notes: input.pickupNotes || 'Package picked up',
        });

        await tx.insert(orderTrackingEvents).values({
          orderId: input.orderId,
          eventType: 'package_picked_up',
          eventData: { notes: input.pickupNotes },
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
            { type: 'text', text: 'picked_up' },
            { type: 'text', text: 'on the way' },
            { type: 'text', text: `${order.pickupAddress} to ${order.dropoffAddress}` },
            { type: 'text', text: trackingUrl }
          ]
        );

        return { success: true, order: updatedOrder };
      });
    }),

  markAsInTransit: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
      currentLatitude: z.number().optional(),
      currentLongitude: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.driverId, ctx.session.user.id),
              eq(orders.status, 'picked_up'),
              isNull(orders.deletedAt)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found or not in correct status",
          });
        }

        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: 'in_transit',
          })
          .where(eq(orders.orderId, input.orderId))
          .returning();

        await tx.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: 'in_transit',
          changedBy: ctx.session.user.id,
          notes: input.notes || 'Package in transit',
        });

        await tx.insert(orderTrackingEvents).values({
          orderId: input.orderId,
          eventType: 'in_transit',
          eventData: {
            latitude: input.currentLatitude,
            longitude: input.currentLongitude,
            notes: input.notes,
          },
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
            { type: 'text', text: 'in_transit' },
            { type: 'text', text: 'arriving soon' },
            { type: 'text', text: `${order.pickupAddress} to ${order.dropoffAddress}` },
            { type: 'text', text: trackingUrl }
          ]
        );

        return { success: true, order: updatedOrder };
      });
    }),

  sendDeliveryOTP: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.driverId, ctx.session.user.id),
              inArray(orders.status, ['picked_up', 'in_transit']),
              isNull(orders.deletedAt)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found or not in correct status",
          });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await tx.insert(otpCode).values({
          orderId: input.orderId,
          otp: otp,
          expiresAt: expiresAt,
        });
        console.log("OTP Sent Out", otp)
        await sendWhatsAppTemplate(
          order.dropoffContactPhone,
          'deliverytracking',
          [
            { type: 'text', text: order.dropoffContactName },
            { type: 'text', text: 'arriving_soon`' },
            { type: 'text', text: 'awaiting otp' },
            { type: 'text', text: `Your OTP is ${otp}, Kindly give this to the driver` },
            { type: 'text', text: otp }
          ]
        );;

        return {
          success: true,
          message: "OTP sent to recipient",
        };
      });
    }),

  markAsDelivered: protectedProcedure
    .input(z.object({
      orderId: z.number().int(),
      otp: z.string().length(6),
      deliveryNotes: z.string().optional(),
      recipientName: z.string().optional(),
      deliveryLatitude: z.number().optional(),
      deliveryLongitude: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderId, input.orderId),
              eq(orders.driverId, ctx.session.user.id),
              inArray(orders.status, ['picked_up', 'in_transit']),
              isNull(orders.deletedAt)
            )
          )
          .limit(1);

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found or not in correct status",
          });
        }

        const [otpRecord] = await tx
          .select()
          .from(otpCode)
          .where(
            and(
              eq(otpCode.orderId, input.orderId),
              eq(otpCode.otp, input.otp)
            )
          )
          .orderBy(desc(otpCode.id))
          .limit(1);

        if (!otpRecord) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid OTP code",
          });
        }

        if (new Date() > otpRecord.expiresAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "OTP has expired. Please request a new one.",
          });
        }

        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: 'delivered',
            deliveredAt: new Date(),
            deliveryProofType: 'otp',
            deliveryProofData: input.otp,
            recipientName: input.recipientName,
            deliveryNotes: input.deliveryNotes,
          })
          .where(eq(orders.orderId, input.orderId))
          .returning();

        await tx.insert(orderStatusHistory).values({
          orderId: input.orderId,
          status: 'delivered',
          changedBy: ctx.session.user.id,
                    notes: input.deliveryNotes || 'Package delivered successfully with OTP verification',
                    location: input.deliveryLatitude && input.deliveryLongitude
                      ? { lat: input.deliveryLatitude, lng: input.deliveryLongitude }
                      : null,
                  });

                  await tx.insert(orderTrackingEvents).values({
                    orderId: input.orderId,
                    eventType: 'delivered',
                    eventData: {
                      recipientName: input.recipientName,
                      otpVerified: true,
                      notes: input.deliveryNotes,
                    },
                    latitude: input.deliveryLatitude,
                    longitude: input.deliveryLongitude,
                  });

                  await tx
                    .delete(otpCode)
                    .where(eq(otpCode.id, otpRecord.id));

                  await updateDailyStatistics(tx, updatedOrder, false);
                  await updateBusinessStatistics(tx, updatedOrder, false);
                  await updateDashboardSnapshot(tx);

                  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderId}`;

                  await sendWhatsAppTemplate(
                    order.dropoffContactPhone,
                    'deliverytracking',
                    [
                      { type: 'text', text: order.dropoffContactName },
                      { type: 'text', text: 'delivered' },
                      { type: 'text', text: 'successfully delivered' },
                      { type: 'text', text: `${order.pickupAddress} to ${order.dropoffAddress}` },
                      { type: 'text', text: trackingUrl }
                    ]
                  );

                  return {
                    success: true,
                    order: updatedOrder,
                    message: "Order marked as delivered. You can now accept new orders!",
                  };
                });
              }),

            getCurrentDelivery: protectedProcedure
              .query(async ({ ctx }) => {
                const [activeOrder] = await ctx.db
                  .select()
                  .from(orders)
                  .where(
                    and(
                      eq(orders.driverId, ctx.session.user.id),
                      inArray(orders.status, ['assigned', 'picked_up', 'in_transit']),
                      isNull(orders.deletedAt)
                    )
                  )
                  .limit(1);

                return activeOrder || null;
              }),

            getDriverStats: protectedProcedure
              .query(async ({ ctx }) => {
                const allDriverOrders = await ctx.db
                  .select()
                  .from(orders)
                  .where(
                    and(
                      eq(orders.driverId, ctx.session.user.id),
                      isNull(orders.deletedAt)
                    )
                  );

                const total = allDriverOrders.length;
                const completed = allDriverOrders.filter(o => o.status === 'delivered').length;
                const active = allDriverOrders.filter(o =>
                  ['assigned', 'picked_up', 'in_transit'].includes(o.status)
                ).length;

                const totalEarnings = allDriverOrders
                  .filter(o => o.status === 'delivered')
                  .reduce((sum, o) => sum + parseFloat(o.deliveryFee), 0);

                const today = getTodayDate();
                const todayOrders = allDriverOrders.filter(o => {
                  const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
                  return orderDate === today;
                });

                const todayDeliveries = todayOrders.filter(o => o.status === 'delivered').length;
                const todayEarnings = todayOrders
                  .filter(o => o.status === 'delivered')
                  .reduce((sum, o) => sum + parseFloat(o.deliveryFee), 0);

                const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';

                return {
                  total,
                  completed,
                  active,
                  totalEarnings: totalEarnings.toFixed(2),
                  todayDeliveries,
                  todayEarnings: todayEarnings.toFixed(2),
                  completionRate,
                };
              }),

            getOrderDetails: protectedProcedure
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
                    )
                  )
                  .limit(1);

                if (!order) {
                  throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found",
                  });
                }

                const statusHistory = await ctx.db
                  .select()
                  .from(orderStatusHistory)
                  .where(eq(orderStatusHistory.orderId, input.orderId))
                  .orderBy(desc(orderStatusHistory.changedAt));

                const trackingEvents = await ctx.db
                  .select()
                  .from(orderTrackingEvents)
                  .where(eq(orderTrackingEvents.orderId, input.orderId))
                  .orderBy(desc(orderTrackingEvents.timestamp));

                return {
                  order,
                  statusHistory,
                  trackingEvents,
                };
              }),

            reportIssue: protectedProcedure
              .input(z.object({
                orderId: z.number().int(),
                issueType: z.enum([
                  'address_not_found',
                  'recipient_unavailable',
                  'package_damaged',
                  'access_denied',
                  'weather_delay',
                  'vehicle_issue',
                  'other'
                ]),
                description: z.string().min(1),
                latitude: z.number().optional(),
                longitude: z.number().optional(),
              }))
              .mutation(async ({ ctx, input }) => {
                return ctx.db.transaction(async (tx) => {
                  const [order] = await tx
                    .select()
                    .from(orders)
                    .where(
                      and(
                        eq(orders.orderId, input.orderId),
                        eq(orders.driverId, ctx.session.user.id),
                        inArray(orders.status, ['assigned', 'picked_up', 'in_transit']),
                        isNull(orders.deletedAt)
                      )
                    )
                    .limit(1);

                  if (!order) {
                    throw new TRPCError({
                      code: "NOT_FOUND",
                      message: "Order not found or not in active status",
                    });
                  }

                  await tx.insert(orderTrackingEvents).values({
                    orderId: input.orderId,
                    eventType: 'issue_reported',
                    eventData: {
                      issueType: input.issueType,
                      description: input.description,
                      latitude: input.latitude,
                      longitude: input.longitude,
                      reportedBy: ctx.session.user.id,
                    },
                  });

                  await tx.insert(orderStatusHistory).values({
                    orderId: input.orderId,
                    status: order.status,
                    changedBy: ctx.session.user.id,
                    notes: `Issue reported: ${input.issueType} - ${input.description}`,
                  });

                  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderId}`;
                  const issueMessages: Record<string, string> = {
                    address_not_found: "trouble locating address",
                    recipient_unavailable: "recipient unavailable",
                    package_damaged: "package issue",
                    access_denied: "access issue",
                    weather_delay: "weather delay",
                    vehicle_issue: "vehicle issue",
                    other: "delivery issue",
                  };

                  await sendWhatsAppTemplate(
                    order.dropoffContactPhone,
                    'deliveryissue',
                    [
                      { type: 'text', text: order.dropoffContactName },
                      { type: 'text', text: order.orderNumber },
                      { type: 'text', text: issueMessages[input.issueType] },
                      { type: 'text', text: input.description },
                      { type: 'text', text: trackingUrl }
                    ]
                  );

                  return {
                    success: true,
                    message: "Issue reported successfully. Support team has been notified.",
                  };
                });
              }),

            updateLocation: protectedProcedure
              .input(z.object({
                orderId: z.number().int(),
                latitude: z.number(),
                longitude: z.number(),
              }))
              .mutation(async ({ ctx, input }) => {

                const [order] = await ctx.db
                  .select()
                  .from(orders)
                  .where(
                    and(
                      eq(orders.orderId, input.orderId),
                      eq(orders.driverId, ctx.session.user.id),
                      inArray(orders.status, ['picked_up', 'in_transit']),
                      isNull(orders.deletedAt)
                    )
                  )
                  .limit(1);

                if (!order) {
                  throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found or not in active delivery status",
                  });
                }

                await ctx.db.insert(orderTrackingEvents).values({
                  orderId: input.orderId,
                  eventType: 'location_update',
                  eventData: {
                    latitude: input.latitude,
                    longitude: input.longitude,
                    driverId: ctx.session.user.id,
                  },
                });

                return {
                  success: true,
                  message: "Location updated successfully",
                };
              }),

            getDeliveryHistory: protectedProcedure
              .input(z.object({
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                limit: z.number().int().min(1).max(100).default(50),
                offset: z.number().int().min(0).default(0),
              }))
              .query(async ({ ctx, input }) => {
                const conditions = [
                  eq(orders.driverId, ctx.session.user.id),
                  eq(orders.status, 'delivered'),
                  isNull(orders.deletedAt),
                ];

                if (input.startDate) {
                  conditions.push(sql`${orders.deliveredAt} >= ${input.startDate}`);
                }

                if (input.endDate) {
                  conditions.push(sql`${orders.deliveredAt} <= ${input.endDate}`);
                }

                const deliveries = await ctx.db
                  .select()
                  .from(orders)
                  .where(and(...conditions))
                  .orderBy(desc(orders.deliveredAt))
                  .limit(input.limit)
                  .offset(input.offset);

                const total = await ctx.db
                  .select({ count: sql<number>`count(*)` })
                  .from(orders)
                  .where(and(...conditions));

                const totalEarnings = deliveries.reduce(
                  (sum, order) => sum + parseFloat(order.deliveryFee),
                  0
                );

                return {
                  deliveries,
                  total: total[0]?.count || 0,
                  totalEarnings: totalEarnings.toFixed(2),
                };
              }),

            declineOrder: protectedProcedure
              .input(z.object({
                orderId: z.number().int(),
                reason: z.string().min(1),
              }))
              .mutation(async ({ ctx, input }) => {

                const [order] = await ctx.db
                  .select()
                  .from(orders)
                  .where(
                    and(
                      eq(orders.orderId, input.orderId),
                      eq(orders.status, 'confirmed'),
                      isNull(orders.driverId),
                      isNull(orders.deletedAt)
                    )
                  )
                  .limit(1);

                if (!order) {
                  throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Order not found or already assigned",
                  });
                }

                await ctx.db.insert(orderTrackingEvents).values({
                  orderId: input.orderId,
                  eventType: 'order_declined',
                  eventData: {
                    driverId: ctx.session.user.id,
                    reason: input.reason,
                  },
                });

                return {
                  success: true,
                  message: "Order declined",
                };
              }),

            getEarningsSummary: protectedProcedure
              .input(z.object({
                period: z.enum(['today', 'week', 'month', 'all']).default('all'),
              }))
              .query(async ({ ctx, input }) => {
                const allOrders = await ctx.db
                  .select()
                  .from(orders)
                  .where(
                    and(
                      eq(orders.driverId, ctx.session.user.id),
                      eq(orders.status, 'delivered'),
                      isNull(orders.deletedAt)
                    )
                  );

                let filteredOrders = allOrders;
                const today = getTodayDate();

                if (input.period === 'today') {
                  filteredOrders = allOrders.filter(o => {
                    const orderDate = new Date(o.deliveredAt!).toISOString().split('T')[0];
                    return orderDate === today;
                  });
                } else if (input.period === 'week') {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  filteredOrders = allOrders.filter(o => new Date(o.deliveredAt!) >= weekAgo);
                } else if (input.period === 'month') {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  filteredOrders = allOrders.filter(o => new Date(o.deliveredAt!) >= monthAgo);
                }

                const totalDeliveries = filteredOrders.length;
                const totalEarnings = filteredOrders.reduce(
                  (sum, o) => sum + parseFloat(o.deliveryFee),
                  0
                );
                const urgentDeliveries = filteredOrders.filter(o => o.priority === 'urgent').length;
                const urgentEarnings = filteredOrders
                  .filter(o => o.priority === 'urgent')
                  .reduce((sum, o) => sum + parseFloat(o.deliveryFee), 0);

                const averageEarningsPerDelivery = totalDeliveries > 0
                  ? (totalEarnings / totalDeliveries).toFixed(2)
                  : '0.00';

                return {
                  period: input.period,
                  totalDeliveries,
                  totalEarnings: totalEarnings.toFixed(2),
                  urgentDeliveries,
                  urgentEarnings: urgentEarnings.toFixed(2),
                  averageEarningsPerDelivery,
                };
              }),
          });
