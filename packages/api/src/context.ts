import type { NextRequest } from "next/server";
import { auth } from "@deliverylink/auth";
import {db} from "@deliverylink/db";

export async function createContext(req: NextRequest): Promise<any> {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return {
		session,
		db,
	};
}

type DB = any;
export type Context = Awaited<ReturnType<typeof createContext>> & { db: DB };
