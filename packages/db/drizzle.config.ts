import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
	path: "../../apps/web/.env",
});

export default defineConfig({
	schema: "C:/Users/jason/DeliveryLink/packages/db/src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});
