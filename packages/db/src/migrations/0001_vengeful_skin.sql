CREATE TABLE "business" (
	"business_id" serial PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"address" text NOT NULL,
	"contact_information" text,
	"product_catalog" text,
	"user_id" text,
	CONSTRAINT "business_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"customer_id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"address" text NOT NULL,
	"contact_information" text,
	"user_id" text,
	CONSTRAINT "customer_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_update" (
	"update_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"location" text,
	"status" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver" (
	"driver_id" serial PRIMARY KEY NOT NULL,
	"driver_name" text NOT NULL,
	"vehicle_model" text,
	"vehicle_number_plate" text NOT NULL,
	"driver_rating" integer,
	"driver_status" text NOT NULL,
	"user_id" text,
	CONSTRAINT "driver_vehicle_number_plate_unique" UNIQUE("vehicle_number_plate"),
	CONSTRAINT "driver_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "financial_transaction" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"transaction_status" text NOT NULL,
	"amount" numeric NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"item_name" text NOT NULL,
	"price" numeric NOT NULL,
	"availability" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"driver_id" integer,
	"time_placed" timestamp DEFAULT now() NOT NULL,
	"contents" text,
	"cost" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"order_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_update" ADD CONSTRAINT "delivery_update_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_customer_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_business_id_business_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_driver_id_driver_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("driver_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_id_item_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id") ON DELETE cascade ON UPDATE no action;