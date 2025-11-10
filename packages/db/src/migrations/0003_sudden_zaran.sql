CREATE TABLE "order_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"rated_by" text NOT NULL,
	"driver_rating" integer,
	"rated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_ratings_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_status_enum" (
	"value" varchar(50) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"changed_by" text,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"location" jsonb
);
--> statement-breakpoint
CREATE TABLE "order_tracking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_data" jsonb,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"date" date NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"cancelled_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"avg_order_value" numeric(10, 2),
	"avg_delivery_time" integer,
	"avg_rating" numeric(3, 2),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"cancelled_orders" integer DEFAULT 0 NOT NULL,
	"failed_orders" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"platform_fees" numeric(12, 2) DEFAULT '0' NOT NULL,
	"delivery_fees" numeric(12, 2) DEFAULT '0' NOT NULL,
	"avg_delivery_time" integer,
	"on_time_delivery_rate" numeric(5, 2),
	"avg_rating" numeric(3, 2),
	"active_drivers" integer DEFAULT 0 NOT NULL,
	"active_businesses" integer DEFAULT 0 NOT NULL,
	"new_businesses" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_statistics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "dashboard_snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_orders" integer DEFAULT 0 NOT NULL,
	"pending_orders" integer DEFAULT 0 NOT NULL,
	"drivers_online" integer DEFAULT 0 NOT NULL,
	"today_orders" integer DEFAULT 0 NOT NULL,
	"today_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"today_completions" integer DEFAULT 0 NOT NULL,
	"week_orders" integer DEFAULT 0 NOT NULL,
	"week_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"month_orders" integer DEFAULT 0 NOT NULL,
	"month_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" text NOT NULL,
	"date" date NOT NULL,
	"total_deliveries" integer DEFAULT 0 NOT NULL,
	"completed_deliveries" integer DEFAULT 0 NOT NULL,
	"failed_deliveries" integer DEFAULT 0 NOT NULL,
	"total_earnings" numeric(10, 2) DEFAULT '0' NOT NULL,
	"avg_delivery_time" integer,
	"avg_rating" numeric(3, 2),
	"total_distance_covered" numeric(10, 2),
	"hours_online" numeric(5, 2),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_driver_id_driver_driver_id_fk";
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "order_number" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_contact_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_contact_phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pickup_instructions" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_contact_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_contact_phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "dropoff_instructions" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "package_description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "package_weight" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "package_size" varchar(20);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "package_quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "package_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivery_fee" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "platform_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "total_cost" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "currency" varchar(3) DEFAULT 'KES' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "estimated_distance" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "estimated_duration" integer;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "actual_distance" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "actual_duration" integer;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "scheduled_pickup_time" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "picked_up_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "in_transit_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivery_proof_type" varchar(50);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivery_proof_data" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "recipient_name" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivery_notes" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "priority" varchar(20) DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "is_fragile" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_notified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "sms_notifications_sent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_ratings" ADD CONSTRAINT "order_ratings_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_ratings" ADD CONSTRAINT "order_ratings_rated_by_user_id_fk" FOREIGN KEY ("rated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_tracking_events" ADD CONSTRAINT "order_tracking_events_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_statistics" ADD CONSTRAINT "business_statistics_business_id_user_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_statistics" ADD CONSTRAINT "driver_statistics_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "pick_up_location";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "drop_off_location";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "time_placed";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "contents";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "cost";--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_order_number_unique" UNIQUE("order_number");