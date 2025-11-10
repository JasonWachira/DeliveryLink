
import { protectedProcedure, publicProcedure, router } from "../index";
import { driverRouter } from "./deliver";
import { orderRouter } from "./order";
import { statisticsRouter } from "./statistics";
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
	order: orderRouter,
	statistics: statisticsRouter,
	driver: driverRouter,
}) as any;

export type AppRouter = typeof appRouter;
