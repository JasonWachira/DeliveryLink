"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";


export default function PlaceOrderPage() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contents, setContents] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const placeOrderMutation = useMutation(
    trpc.order.placeOrder.mutationOptions({
      onSuccess: () => {
        setOrderPlaced(true);
        toast.success("Order placed successfully!");
      },
      onError: (error) => {
        console.error("Order placement error:", error);
        toast.error(error.message || "Failed to place order");
      },
    })
  )


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation || !deliveryAddress || !contents) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToast = toast.loading("Placing your order...");

    try {
      placeOrderMutation.mutate({
        pickupLocation,
        deliveryAddress,
        contents,
      });
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
    }
  };

  const resetForm = () => {
    setOrderPlaced(false);
    setPickupLocation("");
    setDeliveryAddress("");
    setContents("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Place an Order</h1>
          <p className="text-muted-foreground">
            Fill in the details below to place your delivery order
          </p>
        </div>

        {!orderPlaced ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Input
                id="pickupLocation"
                type="text"
                placeholder="Enter pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
                maxLength={255}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input
                id="deliveryAddress"
                type="text"
                placeholder="Enter delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                maxLength={255}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contents">Package Contents</Label>
              <Textarea
                id="contents"
                placeholder="Describe the package contents"
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                required
                maxLength={255}
                className="min-h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {contents.length}/255 characters
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">Estimated Cost</p>
              <p className="text-2xl font-bold">KSh 2,000</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={
                placeOrderMutation.isPending ||
                !pickupLocation ||
                !deliveryAddress ||
                !contents
              }
            >
              {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Order Placed Successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your delivery order has been received and will be processed shortly.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium">{pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="text-sm font-medium">{deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contents</p>
                  <p className="text-sm font-medium">{contents}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full h-12"
                onClick={() => window.location.href = "/dashboard"}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={resetForm}
              >
                Place Another Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
