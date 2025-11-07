import { pgTable, text, timestamp, serial, integer, numeric, varchar, jsonb, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { drivers } from "./drivers";

export const orderStatusEnum = pgTable("order_status_enum", {
  value: varchar("value", { length: 50 }).primaryKey(),
});

// Predefined statuses: 'pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'

export const orders = pgTable("order", {

  orderId: serial("order_id").primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  customerId: text("customer_id")
    .references(() => user.id)
    .notNull(),
  businessId: text("business_id")
    .references(() => user.id)
    .notNull(),
  driverId: text("driver_id").references(() => user.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  pickupContactName: varchar("pickup_contact_name", { length: 255 }).notNull(),
  pickupContactPhone: varchar("pickup_contact_phone", { length: 20 }).notNull(),
  pickupAddress: text("pickup_address").notNull(),
  pickupLatitude: numeric("pickup_latitude", { precision: 10, scale: 7 }),
  pickupLongitude: numeric("pickup_longitude", { precision: 10, scale: 7 }),
  pickupInstructions: text("pickup_instructions"),
  dropoffContactName: varchar("dropoff_contact_name", { length: 255 }).notNull(),
  dropoffContactPhone: varchar("dropoff_contact_phone", { length: 20 }).notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  dropoffLatitude: numeric("dropoff_latitude", { precision: 10, scale: 7 }),
  dropoffLongitude: numeric("dropoff_longitude", { precision: 10, scale: 7 }),
  dropoffInstructions: text("dropoff_instructions"),
  packageDescription: text("package_description").notNull(),
  packageWeight: numeric("package_weight", { precision: 8, scale: 2 }), // in kg
  packageSize: varchar("package_size", { length: 20 }), // 'small', 'medium', 'large'
  packageQuantity: integer("package_quantity").notNull().default(1),
  packageValue: numeric("package_value", { precision: 10, scale: 2 }), // for insurance
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  platformFee: numeric("platform_fee", { precision: 10, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("KES"),
  estimatedDistance: numeric("estimated_distance", { precision: 8, scale: 2 }), // in km
  estimatedDuration: integer("estimated_duration"), // in minutes
  actualDistance: numeric("actual_distance", { precision: 8, scale: 2 }),
  actualDuration: integer("actual_duration"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  confirmedAt: timestamp("confirmed_at"),
  assignedAt: timestamp("assigned_at"),
  pickedUpAt: timestamp("picked_up_at"),
  inTransitAt: timestamp("in_transit_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
  deliveryProofType: varchar("delivery_proof_type", { length: 50 }), //  'otp'
  deliveryProofData: text("delivery_proof_data"), // URL to photo or signature data
  recipientName: varchar("recipient_name", { length: 255 }),
  deliveryNotes: text("delivery_notes"),


  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // 'urgent', 'normal', 'scheduled'
  isFragile: boolean("is_fragile").notNull().default(false),

  customerNotified: boolean("customer_notified").notNull().default(false),
  smsNotificationsSent: integer("sms_notifications_sent").notNull().default(0),

  metadata: jsonb("metadata"),
  deletedAt: timestamp("deleted_at"),// We can do a soft deleted
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.orderId)
    .notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  changedBy: text("changed_by").references(() => user.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  notes: text("notes"),
  location: jsonb("location"), // { lat, lng } at time of status change
});

export const orderTrackingEvents = pgTable("order_tracking_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.orderId)
    .notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventData: jsonb("event_data"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});


export const orderRatings = pgTable("order_ratings", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.orderId)
    .notNull()
    .unique(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  ratedBy: text("rated_by")
    .references(() => user.id)
    .notNull(),
  driverRating: integer("driver_rating"),
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
});
