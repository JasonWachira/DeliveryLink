import type { auth } from "@deliverylink/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [ magicLinkClient(),inferAdditionalFields<typeof auth>()],
});
