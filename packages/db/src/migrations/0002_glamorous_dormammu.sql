ALTER TABLE "order" DROP CONSTRAINT "order_customer_id_customer_customer_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_business_id_business_business_id_fk";
--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "business_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pick_up_location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "drop_off_location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_business_id_user_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;