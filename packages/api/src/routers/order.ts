import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { orders, orderStatusHistory, orderTrackingEvents } from "@deliverylink/db/schema/order";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql } from "drizzle-orm";

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `DL-${year}-${random}`;
};

export const orderRouter = router({
  placeOrder: protectedProcedure
    .input(z.object({
      pickupContactName: z.string().min(1).max(255),
      pickupContactPhone: z.string().min(1).max(20),
      pickupAddress: z.string().min(1),
      pickupLatitude: z.number().optional(),
      pickupLongitude: z.number().optional(),
      pickupInstructions: z.string().optional(),
      dropoffContactName: z.string().min(1).max(255),
      dropoffContactPhone: z.string().min(1).max(20),
      dropoffAddress: z.string().min(1),
      dropoffLatitude: z.number().optional(),
      dropoffLongitude: z.number().optional(),
      dropoffInstructions: z.string().optional(),
      packageDescription: z.string().min(1),
      packageWeight: z.number().positive().optional(),
      packageSize: z.enum(['small', 'medium', 'large']).optional(),
      packageQuantity: z.number().int().positive().default(1),
      packageValue: z.number().positive().optional(),
      priority: z.enum(['urgent', 'normal', 'scheduled']).default('normal'),
      isFragile: z.boolean().default(false),
      scheduledPickupTime: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const orderNumber = generateOrderNumber();

        const deliveryFee = input.priority === 'urgent' ? 300 : 200;
        const platformFee = deliveryFee * 0.15;
        const totalCost = deliveryFee + platformFee;

        const [newOrder] = await tx
          .insert(orders)
          .values({
            orderNumber,
            customerId: ctx.session.user.id,
            businessId: ctx.session.user.id,
            status: 'pending',
            pickupContactName: input.pickupContactName,
            pickupContactPhone: input.pickupContactPhone,
            pickupAddress: input.pickupAddress,
            pickupLatitude: input.pickupLatitude?.toString(),
            pickupLongitude: input.pickupLongitude?.toString(),
            pickupInstructions: input.pickupInstructions,
            dropoffContactName: input.dropoffContactName,
            dropoffContactPhone: input.dropoffContactPhone,
            dropoffAddress: input.dropoffAddress,
            dropoffLatitude: input.dropoffLatitude?.toString(),
            dropoffLongitude: input.dropoffLongitude?.toString(),
            dropoffInstructions: input.dropoffInstructions,
            packageDescription: input.packageDescription,
            packageWeight: input.packageWeight?.toString(),
            packageSize: input.packageSize,
            packageQuantity: input.packageQuantity,
            packageValue: input.packageValue?.toString(),
            deliveryFee: deliveryFee.toString(),
            platformFee: platformFee.toString(),
            totalCost: totalCost.toString(),
            priority: input.priority,
            isFragile: input.isFragile,
            scheduledPickupTime: input.scheduledPickupTime,
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
          status: 'pending',
          changedBy: ctx.session.user.id,
          notes: 'Order created',
        });

        await tx.insert(orderTrackingEvents).values({
          orderId: newOrder.orderId,
          eventType: 'order_created',
          eventData: { orderNumber },
        });

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
        eq(orders.deletedAt, null),
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
            eq(orders.deletedAt, null)
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
            eq(orders.deletedAt, null)
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
              eq(orders.deletedAt, null)
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
            eq(orders.deletedAt, null)
          )
        );

      const total = allOrders.length;
      const completed = allOrders.filter(o => o.status === 'delivered').length;
      const cancelled = allOrders.filter(o => o.status === 'cancelled').length;
      const active = allOrders.filter(o => ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit'].includes(o.status)).length;

      const totalSpent = allOrders
        .filter(o => o.status === 'delivered')
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
