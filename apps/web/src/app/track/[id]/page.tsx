"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Package,
  User,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Navigation,
  Star,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Weight,
  Box,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";

// Dynamically import the Map component to avoid SSR issues
const OrderTrackingMap = dynamic(() => import("./OrderTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface TrackingEvent {
  id: number;
  eventType: string;
  eventData: any;
  timestamp: Date;
  latitude: number | null;
  longitude: number | null;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Waiting for confirmation",
    progress: 10,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500",
    icon: CheckCircle2,
    description: "Order confirmed, assigning driver",
    progress: 25,
  },
  assigned: {
    label: "Driver Assigned",
    color: "bg-indigo-500",
    icon: User,
    description: "Driver has been assigned",
    progress: 40,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-purple-500",
    icon: Package,
    description: "Package picked up from sender",
    progress: 60,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-orange-500",
    icon: Truck,
    description: "On the way to destination",
    progress: 80,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500",
    icon: CheckCircle2,
    description: "Successfully delivered",
    progress: 100,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500",
    icon: XCircle,
    description: "Order cancelled",
    progress: 0,
  },
  failed: {
    label: "Failed",
    color: "bg-red-700",
    icon: AlertCircle,
    description: "Delivery failed",
    progress: 0,
  },
};

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderIdParam = params?.id as string;
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;
  const isValidOrderId = orderId !== null && !isNaN(orderId);

  const order = useQuery({
    ...trpc.order.getOrderById.queryOptions({ orderId: orderId! }),
    enabled: isValidOrderId,
    refetchInterval: 10000,
  });

  const trackingEvents = useQuery({
    ...trpc.order.getOrderTrackingEvents.queryOptions({ orderId: orderId! }),
    enabled: isValidOrderId,
    refetchInterval: 15000,
  });

  const statusHistory = useQuery({
    ...trpc.order.getOrderStatusHistory.queryOptions({ orderId: orderId! }),
    enabled: isValidOrderId,
  });

  const cancelOrderMutation = useMutation(
    trpc.order.cancelOrder.mutationOptions({
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        order.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to cancel order");
      },
    })
  );

  const handleCancelOrder = () => {
    if (!isValidOrderId) return;
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const reason = window.prompt("Please provide a reason for cancellation:");
      if (reason && reason.trim()) {
        cancelOrderMutation.mutate({ orderId: orderId!, reason: reason.trim() });
      }
    }
  };

  const canCancelOrder = order.data && ["pending", "confirmed", "assigned"].includes(order.data.status);

  if (!isValidOrderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-destructive/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Invalid Order ID</h2>
              <p className="text-muted-foreground">
                The order ID provided is not valid. Please check and try again.
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading order details...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your tracking information</p>
          </div>
        </div>
      </div>
    );
  }

  if (order.error || !order.data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-destructive/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
              <p className="text-muted-foreground">
                {order.error?.message || "The order you're looking for doesn't exist or you don't have access to it."}
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.data.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  const timelineEvents = [
    { status: "pending", label: "Order Placed", timestamp: order.data.createdAt },
    { status: "confirmed", label: "Confirmed", timestamp: order.data.confirmedAt },
    { status: "assigned", label: "Driver Assigned", timestamp: order.data.assignedAt },
    { status: "picked_up", label: "Picked Up", timestamp: order.data.pickedUpAt },
    { status: "in_transit", label: "In Transit", timestamp: order.data.inTransitAt },
    { status: "delivered", label: "Delivered", timestamp: order.data.deliveredAt },
  ].filter(event => event.timestamp || order.data.status === event.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>

            {canCancelOrder && (
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="gap-2"
              >
                {cancelOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Order Status Header */}
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      #{order.data.orderNumber}
                    </h1>
                    <Badge className={`${statusInfo?.color} text-white px-3 py-1 text-sm`}>
                      <StatusIcon className="mr-1 h-3.5 w-3.5" />
                      {statusInfo?.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Created {format(new Date(order.data.createdAt), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{statusInfo?.description}</span>
                  <span className="text-muted-foreground">{statusInfo?.progress}%</span>
                </div>
                <Progress value={statusInfo?.progress} className="h-2" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="font-semibold">{order.data.currency} {Number(order.data.totalCost).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="font-semibold capitalize">{order.data.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                    <p className="font-semibold">{order.data.estimatedDuration || 'N/A'} mins</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Card */}
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTrackingMap
                  pickupLat={order.data.pickupLatitude ? parseFloat(order.data.pickupLatitude) : undefined}
                  pickupLng={order.data.pickupLongitude ? parseFloat(order.data.pickupLongitude) : undefined}
                  dropoffLat={order.data.dropoffLatitude ? parseFloat(order.data.dropoffLatitude) : undefined}
                  dropoffLng={order.data.dropoffLongitude ? parseFloat(order.data.dropoffLongitude) : undefined}
                  driverLat={undefined} // Add driver location when available
                  driverLng={undefined}
                  status={order.data.status}
                />
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pickup Location */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-gradient-to-b from-green-500 to-red-500" />

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Pickup Location
                        </p>
                        {order.data.pickedUpAt && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Picked Up
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">{order.data.pickupAddress}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.data.pickupContactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.data.pickupContactPhone}</span>
                        </div>
                      </div>

                      {order.data.pickupInstructions && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {order.data.pickupInstructions}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="relative pl-8 pt-6">
                    <div className="absolute left-0 top-6 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Delivery Location
                        </p>
                        {order.data.deliveredAt && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Delivered
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">{order.data.dropoffAddress}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.data.dropoffContactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.data.dropoffContactPhone}</span>
                        </div>
                      </div>

                      {order.data.dropoffInstructions && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {order.data.dropoffInstructions}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline and Tracking Tabs */}
            <Card className="shadow-lg">
              <Tabs defaultValue="timeline" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="timeline">Status Timeline</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking Events</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="timeline" className="mt-0">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {timelineEvents.map((event, index) => {
                          const isCompleted = event.timestamp !== null;
                          const isCurrent = order.data.status === event.status && !event.timestamp;
                          const EventIcon = statusConfig[event.status as keyof typeof statusConfig]?.icon || Clock;
                          const eventColor = statusConfig[event.status as keyof typeof statusConfig]?.color;

                          return (
                            <div key={event.status} className="relative flex items-start gap-4 group">
                              {index < timelineEvents.length - 1 && (
                                <div
                                  className={`absolute left-5 top-12 w-0.5 h-full transition-colors ${
                                    isCompleted ? "bg-primary" : "bg-muted"
                                  }`}
                                />
                              )}

                              <div
                                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                  isCompleted
                                    ? `${eventColor} text-white shadow-lg scale-110`
                                    : isCurrent
                                    ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <EventIcon className="h-5 w-5" />
                              </div>

                              <div className="flex-1 pb-8">
                                <div className={`rounded-lg p-4 transition-all ${
                                  isCompleted || isCurrent
                                    ? "bg-muted/50 border-2 border-primary/20"
                                    : "bg-muted/20"
                                }`}>
                                  <p className={`font-semibold ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                                    {event.label}
                                  </p>
                                  {event.timestamp && (
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                                    </p>
                                  )}
                                  {isCurrent && !event.timestamp && (
                                    <p className="text-sm text-primary mt-1 flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      In Progress
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="tracking" className="mt-0">
                    <ScrollArea className="h-[400px] pr-4">
                      {trackingEvents.data && trackingEvents.data.length > 0 ? (
                        <div className="space-y-3">
                          {trackingEvents.data.map((event) => (
                            <div key={event.id} className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{event.eventType.replace(/_/g, ' ').toUpperCase()}</p>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                                  </p>
                                  {event.eventData && Object.keys(event.eventData).length > 0 && (
                                    <div className="mt-2 text-xs bg-background rounded p-2 font-mono overflow-x-auto">
                                      {JSON.stringify(event.eventData, null, 2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center">
                          <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground">No tracking events yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Package and Details */}
          <div className="space-y-6">
            {/* Package Details */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Description</p>
                  <p className="font-medium">{order.data.packageDescription}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Box className="h-3 w-3" />
                      <span>Size</span>
                    </div>
                    <p className="font-semibold capitalize">{order.data.packageSize || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Weight className="h-3 w-3" />
                      <span>Weight</span>
                    </div>
                    <p className="font-semibold">{order.data.packageWeight ? `${order.data.packageWeight} kg` : "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{order.data.packageQuantity} item(s)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="font-semibold">{order.data.packageValue ? `${order.data.currency} ${order.data.packageValue}` : "N/A"}</p>
                  </div>
                </div>

                {order.data.isFragile && (
                  <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertTitle className="text-orange-900 dark:text-orange-300">Fragile Item</AlertTitle>
                    <AlertDescription className="text-orange-800 dark:text-orange-400">
                      This package requires special handling
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">{order.data.currency} {Number(order.data.deliveryFee).toFixed(2)}</span>
                  </div>

                  {order.data.platformFee && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-semibold">{order.data.currency} {Number(order.data.platformFee).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center py-2 bg-primary/10 rounded-lg px-3">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {order.data.currency} {Number(order.data.totalCost).toFixed(2)}
                  </span>
                </div>

                {(order.data.estimatedDistance || order.data.estimatedDuration) && (
                  <div className="pt-4 space-y-2">
                    {order.data.estimatedDistance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Distance</span>
                        <span className="font-medium">{Number(order.data.estimatedDistance).toFixed(2)} km</span>
                      </div>
                                          )}
                                          {order.data.estimatedDuration && (
                                            <div className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">Estimated Duration</span>
                                              <span className="font-medium">{order.data.estimatedDuration} mins</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Delivery Proof (if delivered) */}
                                  {order.data.status === "delivered" && (
                                    <Card className="shadow-lg border-green-200 dark:border-green-800">
                                      <CardHeader className="bg-green-50 dark:bg-green-900/20">
                                        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
                                          <CheckCircle2 className="h-5 w-5" />
                                          Delivery Proof
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="pt-6 space-y-4">
                                        {order.data.deliveryProofType && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Proof Type</p>
                                            <p className="font-semibold capitalize">{order.data.deliveryProofType}</p>
                                          </div>
                                        )}

                                        {order.data.recipientName && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Received By</p>
                                            <p className="font-semibold">{order.data.recipientName}</p>
                                          </div>
                                        )}

                                        {order.data.deliveredAt && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivered At</p>
                                            <p className="font-semibold">{format(new Date(order.data.deliveredAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                                          </div>
                                        )}

                                        {order.data.deliveryNotes && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                                            <p className="font-medium text-sm">{order.data.deliveryNotes}</p>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Rating Card */}
                                  <Card className="shadow-lg">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Rate This Delivery
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {order.data.status === "delivered" ? (
                                        <div className="space-y-4">
                                          <p className="text-sm text-muted-foreground">
                                            Share your experience to help us improve our service
                                          </p>
                                          <Button className="w-full gap-2" size="lg">
                                            <Star className="h-4 w-4" />
                                            Rate Now
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="text-center py-4">
                                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Star className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            Rating will be available after delivery
                                          </p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Help & Support */}
                                  <Card className="shadow-lg">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Need Help?
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <Button variant="outline" className="w-full justify-between group" size="lg">
                                        <span className="flex items-center gap-2">
                                          <Phone className="h-4 w-4" />
                                          Contact Support
                                        </span>
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                      </Button>
                                      <Button variant="outline" className="w-full justify-between group" size="lg">
                                        <span className="flex items-center gap-2">
                                          <MessageCircle className="h-4 w-4" />
                                          Report an Issue
                                        </span>
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
