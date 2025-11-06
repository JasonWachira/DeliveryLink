import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";
export const drivers = pgTable("driver", {
  // *driver_id 
  driverId: serial("driver_id").primaryKey(),
  
  // Attributes
  driverName: text("driver_name").notNull(),  
  vehicleModel: text("vehicle_model"),  
  vehicleNumberPlate: text("vehicle_number_plate").unique().notNull(),  
  driverRating: integer("driver_rating"), 
  driverStatus: text("driver_status").notNull(), 
  
  
  userId: text("user_id").unique(),
});