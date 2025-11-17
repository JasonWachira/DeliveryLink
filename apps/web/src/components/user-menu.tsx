// apps/web/src/components/user-menu.tsx
// Component: UserMenu
// Purpose: display authentication related actions in the header (Sign In or account menu)
// Notes:
// - Uses `authClient.useSession()` to read session state. While `isPending` is true we render a lightweight
//   skeleton placeholder to avoid layout shifts. When no session exists we render a Sign In button.
// - When a session exists we show a dropdown with account information and a Sign Out action.
// - The Sign Out action calls `authClient.signOut()` and uses the router to redirect on success.
// - Accessibility: the dropdown components should manage ARIA attributes; keep the trigger as a native
//   interactive element (Button) to ensure keyboard accessibility.
// TODOs:
// - Add avatar support for the user when available (reduce visual noise for long names).
// - Add error handling for signOut failures and show a user-visible toast message.
// - Consider extracting menu items into a smaller component for easier testing.
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * UserMenu
 *
 * Renders the header-level user menu. Behavior:
 * - When session is loading (isPending) show a Skeleton placeholder to avoid layout shift.
 * - When there is no authenticated session, render a Sign In button that links to `/login`.
 * - When the user is authenticated, show a dropdown trigger with the user's name and
 *   menu items including the email and a Sign Out button.
 *
 * Notes on error handling and UX:
 * - Currently sign out redirects to `/` on success. Failures are not surfaced to the UI.
 * - Keep the displayed name short to avoid layout issues in the header; consider truncation.
 */
export default function UserMenu() {
	const router = useRouter();
	// authClient.useSession() returns a session object and an isPending flag while the auth state resolves.
	// `session` is undefined when unauthenticated.
	const { data: session, isPending } = authClient.useSession();

	// While auth state is resolving, render a small skeleton to indicate loading and preserve layout.
	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	// If there's no session, show a Sign In CTA. `asChild` allows Link to be the actual interactive element
	// while preserving Button styling. This keeps semantics: Link is still the element that is focused/clicked.
	if (!session) {
		return (
			<Button variant="outline" asChild>
				<Link href="/login">Sign In</Link>
			</Button>
		);
	}

	// When session is available, show the dropdown menu with account details and sign-out.
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{/* Use the user's name as the trigger label. Consider adding an avatar here in future. */}
				<Button variant="outline">{session.user.name}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{/* Show the user's email as an informational item. Not interactive. */}
				<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
				<DropdownMenuItem asChild>
					{/*
						Sign Out button
						- Uses authClient.signOut() to clear the session on the server/client.
						- The fetchOptions.onSuccess callback performs a client-side redirect.
						- Consider adding onError handling to show a toast or retry option.
					*/}
					<Button
						variant="destructive"
						className="w-full"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										// Redirect user to home after successful sign out.
										router.push("/");
									},
								},
							});
						}}
					>
						Sign Out
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
