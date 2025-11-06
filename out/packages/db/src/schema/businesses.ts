import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";

export const businesses = pgTable("business", {
  // *business_id 
  businessId: serial("business_id").primaryKey(),
  
  // Attributes
  businessName: text("business_name").notNull(), 
  address: text("address").notNull(), 
  contactInformation: text("contact_information"), 
  productCatalog: text("product_catalog"), 
  
  userId: text("user_id").unique(),
});
