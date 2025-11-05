import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";

export const items = pgTable("item", {
  // *item_id 
  itemId: serial("item_id").primaryKey(),
  
  // Attributes
  itemName: text("item_name").notNull(), 
  price: numeric("price").notNull(), 
  availability: boolean("availability").default(true).notNull(), 
});