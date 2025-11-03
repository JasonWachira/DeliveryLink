import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const customers = pgTable("customer", {
    customerId: serial("customer_id").primaryKey(),
    customerName: text("customer_name").notNull(),
    address: text("address").notNull(),
    contactInformation: text("contact_information"),
    
    
    userId: text("user_id")
        .unique() 
        .references(() => user.id, { onDelete: "cascade" }), 
        
});
