import { customers } from "@deliverylink/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";


export async function getCustomerIdFromSession(db: any, userId: string): Promise<number> {
    const customer = await db.query.customers.findFirst({
        where: eq(customers.userId, userId),
        columns: { customerId: true },
    });
    
    if (!customer) {
        throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "User profile is not linked to a customer account." 
        });
    }
    return customer.customerId;
}