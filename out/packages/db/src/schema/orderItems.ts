import { pgTable, integer } from "drizzle-orm/pg-core";
import { orders } from "./order.js";
import { items } from "./items.js";    


export const orderItems = pgTable("order_item", {
  orderId: integer("order_id")
    .references(() => orders.orderId, { onDelete: "cascade" })
    .notNull(),
  itemId: integer("item_id")
    .references(() => items.itemId, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  
  // Composite Primary Key
}, (t) => ({
  pk: [t.orderId, t.itemId],
}));