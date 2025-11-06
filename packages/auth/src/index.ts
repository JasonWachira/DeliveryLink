import { nextCookies } from 'better-auth/next-js';
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@deliverylink/db";
import * as schema from "@deliverylink/db/schema/auth";
import { sendMagicLinkEmail } from "../email";
import { createAuthMiddleware, magicLink } from "better-auth/plugins";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
 socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID!,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [nextCookies(),
    magicLink({
    sendMagicLink: async ({ email, token, url }, request) => {
      await sendMagicLinkEmail(email, url);
    },
  }),]
});
