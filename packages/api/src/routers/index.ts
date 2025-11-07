import { protectedProcedure, publicProcedure, router } from "../index";
import { orderRouter } from "./order";
import { todoRouter } from "./todo";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	order: orderRouter
});
export type AppRouter = typeof appRouter;
