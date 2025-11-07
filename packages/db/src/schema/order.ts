import { pgTable, text, timestamp, boolean, serial, integer, numeric } from "drizzle-orm/pg-core";
import { customers } from "./customer";
import {businesses} from "./businesses";
import {drivers} from "./drivers";
import {user} from "./auth";
export const orders = pgTable("order", {
  orderId: serial("order_id").primaryKey(),
  customerId: text("customer_id")
    .references(() => user.id)
    .notNull(),
  businessId: text("business_id")
    .references(() => user.id)
    .notNull(),
  pickUpLocation: text("pick_up_location").notNull(),
  dropOffLocation: text("drop_off_location").notNull(),
  driverId: integer("driver_id").references(() => drivers.driverId),
  timePlaced: timestamp("time_placed").defaultNow().notNull(),
  contents: text("contents"),
  cost: numeric("cost").notNull(),
});
