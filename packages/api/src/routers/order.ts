

import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { orders} from "@deliverylink/db/schema/order";

import { TRPCError } from "@trpc/server";
import { getCustomerIdFromSession } from "../utils/helpers";

export const orderRouter = router({


  // place: protectedProcedure
  //   .input(
  //     z.object({
  //       businessId: z.number().int(),
  //       cost: z.number().positive(),
  //       contents: z.string().optional(),
  //       // Items for the order
  //       items: z.array(
  //         z.object({
  //           itemId: z.number().int(),
  //           quantity: z.number().int().min(1),
  //         })
  //       ),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //       const userId = ctx.session.user.id;


  //       const customerId = await getCustomerIdFromSession(ctx.db, userId);


  //       return ctx.db.transaction(async (tx) => {

  //           const [newOrder] = await tx
  //               .insert(orders)
  //               .values({
  //                   customerId: customerId,
  //                   businessId: input.businessId,
  //                   cost: input.cost.toFixed(2),
  //                   contents: input.contents,

  //               })
  //               .returning({ orderId: orders.orderId });

  //           const orderId = newOrder?.orderId;
  //           if (!orderId) {
  //               tx.rollback();
  //               throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order." });
  //           }

  //           const orderItemInserts = input.items.map((item) => ({
  //               orderId: orderId,
  //               itemId: item.itemId,
  //               quantity: item.quantity,
  //           }));

  //           await tx.insert(orderItems).values(orderItemInserts);


  //           await tx.insert(financialTransactions).values({
  //               orderId: orderId,
  //               transactionType: "Payment",
  //               transactionStatus: "Pending",
  //               amount: input.cost.toFixed(2),
  //           });

  //           return { success: true, orderId };
  //       });
  //   }),
  placeOrder: protectedProcedure
    .input(z.object({
      pickupLocation: z.string().min(1).max(255),
      deliveryAddress: z.string().min(1).max(255),
      contents: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const [orderAdded] = await ctx.db
        .insert(orders)
        .values({
          customerId: ctx.session.user.id,
          businessId: ctx.session.user.id,
          pickUpLocation: input.pickupLocation,
          dropOffLocation: input.deliveryAddress,
          cost: "2000.00",
          contents: input.contents,
        })
        .returning();

      return { success: true, order: orderAdded };
    })

});
