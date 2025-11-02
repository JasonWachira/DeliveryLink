import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { orders } from "./order";


export const deliveryUpdates = pgTable("delivery_update", {
  // *update_id 
  updateId: serial("update_id").primaryKey(),
  
  // Foreign Key
  orderId: integer("order_id") 
    .references(() => orders.orderId) 
    .notNull(),
    
  // Attributes
  location: text("location"),  
  status: text("status").notNull(), 
  timestamp: timestamp("timestamp").defaultNow().notNull(), 
});