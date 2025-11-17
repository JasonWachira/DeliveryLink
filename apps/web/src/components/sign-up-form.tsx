// apps/web/src/components/sign-up-form.tsx
// Component: SignUpForm
// Purpose: Render a sign-up form that collects name, email, and password and calls
// the auth client to create a new user. This file only contains presentation and
// form wiring; authentication logic (token creation, email verification) lives in the auth package.
//
// Security notes:
// - Do not log passwords or tokens. Keep validation messages generic where appropriate.
// - Consider adding password strength indicators and rate limiting on sign-up endpoints.
//
// UX notes:
// - Uses a skeleton/loader while auth state is pending to avoid redirect/content flash.
// - Validation is performed client-side via zod and the react-form validators; server-side
//   validation should also be enforced.
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

/**
 * SignUpForm
 *
 * Props:
 * - onSwitchToSignIn: callback invoked when the user wants to switch to the sign-in flow.
 *
 * Behavior/contract:
 * - Renders a form bound to @tanstack/react-form with Zod validators.
 * - On successful sign up the user is redirected to `/dashboard` and shown a success toast.
 * - On error a toast is shown with the error message coming from the auth client.
 *
 * Notes:
 * - This component does not handle server-side validation or throttling — those are responsibilities
 *   of the auth API. Keep client-side validation focused on quick, helpful feedback for users.
 */
export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	// `isPending` is true while auth state is resolving. We show a Loader to avoid
	// flashing authenticated/unauthenticated UI during hydration.
	const { isPending } = authClient.useSession();

	const form = useForm({
		// Default form values for controlled inputs
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		// onSubmit performs the sign up via authClient
		onSubmit: async ({ value }) => {
			// Note: value contains the validated form values. Do not log sensitive fields.
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					// Redirect and feedback on success
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Sign up successful");
					},
					// Show an error toast on failure. The auth client surfaces a message.
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		// Client-side validation using Zod. Keep messages user-friendly.
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				// Consider adding a password-strength check here in future.
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	// Show loader during auth resolution to avoid UI flicker.
	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto w-full mt-10 max-w-md p-6">
			<h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

			<form
				// Prevent default browser submission and delegate to react-form's handleSubmit()
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					{/* Name field: controlled via react-form Field API */}
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{/* Render validation errors for this field */}
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					{/* Email field with HTML5 email input type for basic client validation */}
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					{/* Password field: treat as sensitive input; do not expose value in logs */}
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				{/* Submit button connected to react-form's subscription to know submission state */}
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignIn}
					className="text-indigo-600 hover:text-indigo-800"
				>
					Already have an account? Sign In
				</Button>
			</div>
		</div>
	);
}
