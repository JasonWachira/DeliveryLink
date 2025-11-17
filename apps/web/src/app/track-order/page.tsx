"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import {
  Package,
  Search,
  Loader2,
  TruckIcon,
  MapPin,
  ArrowRight,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");

  const orderQuery = useQuery({
    ...trpc.order.getOrderByNumber.queryOptions({
      orderNumber: searchOrderNumber,
    }),
    enabled: !!searchOrderNumber,
  });

  useEffect(() => {
    if (orderQuery.isSuccess && orderQuery.data) {
      toast.success("Order found!");
      router.push(`/track/${orderQuery.data.orderId}`);
    }
  }, [orderQuery.isSuccess, orderQuery.data, router]);

  useEffect(() => {
    if (orderQuery.isError) {
      toast.error("Order not found. Please check your order number.");
      setSearchOrderNumber("");
    }
  }, [orderQuery.isError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    setSearchOrderNumber(orderNumber.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter your order number to get real-time updates on your delivery
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-2">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="orderNumber" className="text-base font-semibold">
                  Order Number
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="e.g., DL-2024-123456"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="pl-12 h-14 text-lg"
                    disabled={orderQuery.isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Your order number can be found in your confirmation email or receipt
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg gap-3"
                disabled={orderQuery.isLoading}
              >
                {orderQuery.isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching for order...
                  </>
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Real-Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  See your package location on the map
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Live Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified at every delivery stage
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg">
                <TruckIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Driver Details</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your driver directly
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*<Alert className="border-2 bg-primary/5 border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Track multiple orders</AlertTitle>
          <AlertDescription className="text-sm">
            You can track multiple orders by entering different order numbers. Each order will have its own dedicated tracking page.
          </AlertDescription>
        </Alert>*/}

        <div className="text-center space-y-4">
          {/*<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Secure tracking</span>
            <span className="text-muted-foreground/50">•</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>24/7 support</span>
            <span className="text-muted-foreground/50">•</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Real-time updates</span>
          </div>*/}

          {/*<div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              Back to Dashboard
            </Button>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

