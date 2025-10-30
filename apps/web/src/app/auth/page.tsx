"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Google } from "@ridemountainpig/svgl-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const loadingToast = toast.loading("Signing in with Google...");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      toast.success("Signed in with Google", { id: loadingToast });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google", { id: loadingToast });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsEmailLoading(true);
    const loadingToast = toast.loading("Sending link...");
    try {
      const { data, error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
        newUserCallbackURL: "/",
        errorCallbackURL: "/error",
      });

      if (!error) {
        setLinkSent(true);
        toast.success("Link sent to your email", { id: loadingToast });
      } else {
        console.error("Email sign in error:", error);
        toast.error("Failed to send link", { id: loadingToast });
      }
    } catch (error) {
      console.error("Email sign in error:", error);
      toast.error("Failed to send link", { id: loadingToast });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const resetForm = () => {
    setLinkSent(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        {!linkSent ? (
          <div className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button
                type="submit"
                className="w-full h-12"
                disabled={isEmailLoading || !email}
              >
                Sign In with Email
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <Google className="mr-2 h-5 w-5" />
              Google
            </Button>

            <p className="text-center text-xs text-muted-foreground px-8">
              By clicking continue, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                Link sent to {email}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={resetForm}
            >
              Try different email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
