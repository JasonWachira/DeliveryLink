import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";
import { customers } from "./customer";
import {businesses} from "./businesses";
import {drivers} from "./drivers";

export const orders = pgTable("order", {
  // *order_id 
  orderId: serial("order_id").primaryKey(),

  // Foreign Keys (Relationships)
  customerId: integer("customer_id")
    .references(() => customers.customerId) // Customer 'places' Order
    .notNull(),
    
  businessId: integer("business_id")
    .references(() => businesses.businessId) // Order 'receives' Business
    .notNull(),

  driverId: integer("driver_id").references(() => drivers.driverId), // Driver 'handles' Order

  // Attributes
  timePlaced: timestamp("time_placed").defaultNow().notNull(), // time_placed 
  contents: text("contents"), // contents 
  cost: numeric("cost").notNull(), // cost 
});