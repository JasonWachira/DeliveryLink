import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const customers = pgTable("customer", {
  // *customer_id 
  customerId: serial("customer_id").primaryKey(),
  
  // Attributes
  customerName: text("customer_name").notNull(), 
  address: text("address").notNull(),  
  contactInformation: text("contact_information"), 
  
 
  userId: text("user_id").unique(), 
});

