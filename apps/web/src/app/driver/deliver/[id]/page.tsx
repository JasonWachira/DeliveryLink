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
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Weight,
  Box,
  AlertTriangle,
  Loader2,
  ChevronRight,
  MessageCircle,
  FileText,
  Send,
   Shield
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderTrackingMap = dynamic(() => import("../../../track/[id]/OrderTrackingMap"), {
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
    description: "Ready for driver assignment",
    progress: 25,
  },
  assigned: {
    label: "Assigned to You",
    color: "bg-indigo-500",
    icon: User,
    description: "You've been assigned this delivery",
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

export default function DriverDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const orderIdParam = params?.id as string;
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;
  const isValidOrderId = orderId !== null && !isNaN(orderId);

  const [pickupNotes, setPickupNotes] = useState("");
  const [transitNotes, setTransitNotes] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [showTransitDialog, setShowTransitDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueType, setIssueType] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  console.log("URL Data", orderIdParam)
  const orderDetails = useQuery({
    ...trpc.driver.getOrderDetails.queryOptions({ orderId: orderId! }),
    enabled: isValidOrderId,
    refetchInterval: 10000,
  });


  const order = orderDetails.data?.order;
  const statusHistory = orderDetails.data?.statusHistory || [];
  const trackingEvents = orderDetails.data?.trackingEvents || [];

  const acceptOrderMutation = useMutation(
    trpc.driver.acceptOrder.mutationOptions({
      onSuccess: () => {
        toast.success("Order accepted successfully!");
        orderDetails.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to accept order");
      },
    })
  );
  const sendOtpMutation = useMutation(
    trpc.driver.sendDeliveryOTP.mutationOptions({
      onSuccess: () => {
        toast.success("OTP sent to recipient successfully!");
        setOtpSent(true);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send OTP");
      },
    })
  );

  const markAsPickedUpMutation = useMutation(
    trpc.driver.markAsPickedUp.mutationOptions({
      onSuccess: () => {
        toast.success("Order marked as picked up!");
        setShowPickupDialog(false);
        setPickupNotes("");
        orderDetails.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to mark as picked up");
      },
    })
  );

  const markAsInTransitMutation = useMutation(
    trpc.driver.markAsInTransit.mutationOptions({
      onSuccess: () => {
        toast.success("Order marked as in transit!");
        setShowTransitDialog(false);
        setTransitNotes("");
        orderDetails.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to mark as in transit");
      },
    })
  );

  const markAsDeliveredMutation = useMutation(
    trpc.driver.markAsDelivered.mutationOptions({
      onSuccess: () => {
        toast.success("Order delivered successfully! You can now accept new orders.");
        setShowDeliveryDialog(false);
        setDeliveryNotes("");
        setRecipientName("");
        setOtp("");
        setOtpSent(false);
        setTimeout(() => {
          router.push("/driver/deliver");
        }, 2000);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to mark as delivered");
      },
    })
  );

  const reportIssueMutation = useMutation(
    trpc.driver.reportIssue.mutationOptions({
      onSuccess: () => {
        toast.success("Issue reported successfully. Support has been notified.");
        setShowIssueDialog(false);
        setIssueType("");
        setIssueDescription("");
        orderDetails.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to report issue");
      },
    })
  );

  const updateLocationMutation = useMutation(
    trpc.driver.updateLocation.mutationOptions({
      onSuccess: () => {
        console.log("Location updated");
      },
      onError: (error: any) => {
        console.error("Failed to update location", error);
      },
    })
  );
  const handleSendOtp = () => {
    if (!isValidOrderId) return;
    sendOtpMutation.mutate({
      orderId: orderId!,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (order && (order.status === "picked_up" || order.status === "in_transit")) {
            updateLocationMutation.mutate({
              orderId: order.orderId,
              latitude: location.lat,
              longitude: location.lng,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your current location");
        }
      );
    }
  };

  const handleAcceptOrder = () => {
    if (!isValidOrderId) return;
    acceptOrderMutation.mutate({ orderId: orderId! });
  };

  const handleMarkAsPickedUp = () => {
    if (!isValidOrderId) return;
    getCurrentLocation();
    markAsPickedUpMutation.mutate({
      orderId: orderId!,
      pickupNotes: pickupNotes.trim() || undefined,
    });
  };

  const handleMarkAsInTransit = () => {
    if (!isValidOrderId) return;
    getCurrentLocation();
    markAsInTransitMutation.mutate({
      orderId: orderId!,
      currentLatitude: currentLocation?.lat,
      currentLongitude: currentLocation?.lng,
      notes: transitNotes.trim() || undefined,
    });
  };

  const handleMarkAsDelivered = () => {
    if (!isValidOrderId) return;
    if (!recipientName.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    getCurrentLocation();
    markAsDeliveredMutation.mutate({
      orderId: orderId!,
      otp: otp.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined,
      recipientName: recipientName.trim(),
      deliveryLatitude: currentLocation?.lat,
      deliveryLongitude: currentLocation?.lng,
    });
  };
  const handleDeliveryDialogClose = (open: boolean) => {
    setShowDeliveryDialog(open);
    if (!open) {
      setOtp("");
      setOtpSent(false);
      setRecipientName("");
      setDeliveryNotes("");
    }
  };

  const handleReportIssue = () => {
    if (!isValidOrderId) return;
    if (!issueType || !issueDescription.trim()) {
      toast.error("Please select issue type and provide description");
      return;
    }
    getCurrentLocation();
    reportIssueMutation.mutate({
      orderId: orderId!,
      issueType: issueType as any,
      description: issueDescription.trim(),
      latitude: currentLocation?.lat,
      longitude: currentLocation?.lng,
    });
  };

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
            <Button onClick={() => router.push("/driver/deliver")} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Available Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderDetails.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading order details...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your delivery information</p>
          </div>
        </div>
      </div>
    );
  }

  if (orderDetails.error || !order) {
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
                {orderDetails.error?.message || "The order you're looking for doesn't exist or you don't have access to it."}
              </p>
            </div>
            <Button onClick={() => router.push("/driver/deliver")} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Available Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  const canAccept = order.status === "confirmed" && !order.driverId;
  const canPickup = order.status === "assigned";
  const canMarkInTransit = order.status === "picked_up";
  const canDeliver = order.status === "picked_up" || order.status === "in_transit";
  const canReportIssue = ["assigned", "picked_up", "in_transit"].includes(order.status);

  const timelineEvents = [
    { status: "pending", label: "Order Placed", timestamp: order.createdAt },
    { status: "confirmed", label: "Confirmed", timestamp: order.confirmedAt },
    { status: "assigned", label: "Assigned to You", timestamp: order.assignedAt },
    { status: "picked_up", label: "Picked Up", timestamp: order.pickedUpAt },
    { status: "in_transit", label: "In Transit", timestamp: order.inTransitAt },
    { status: "delivered", label: "Delivered", timestamp: order.deliveredAt },
  ].filter(event => event.timestamp || order.status === event.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-12">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/driver/deliver")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Available Orders
            </Button>

            <div className="flex items-center gap-2">
              {canReportIssue && (
                <Button variant="outline" onClick={() => setShowIssueDialog(true)} className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      #{order.orderNumber}
                    </h1>
                    <Badge className={`${statusInfo?.color} text-white px-3 py-1 text-sm`}>
                      <StatusIcon className="mr-1 h-3.5 w-3.5" />
                      {statusInfo?.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Created {format(new Date(order.createdAt), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{statusInfo?.description}</span>
                  <span className="text-muted-foreground">{statusInfo?.progress}%</span>
                </div>
                <Progress value={statusInfo?.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Your Earnings</p>
                    <p className="font-semibold text-green-600">{order.currency} {Number(order.deliveryFee).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="font-semibold capitalize">{order.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                    <p className="font-semibold">{order.estimatedDuration || 'N/A'} mins</p>
                  </div>
                </div>
              </div>

              {canAccept && (
                <Alert className="bg-primary/5 border-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Ready to Accept</AlertTitle>
                  <AlertDescription>
                    This order is available for you to accept. Review the details and accept when ready.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Delivery Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderTrackingMap
                  pickupLat={order.pickupLatitude ? parseFloat(order.pickupLatitude) : undefined}
                  pickupLng={order.pickupLongitude ? parseFloat(order.pickupLongitude) : undefined}
                  dropoffLat={order.dropoffLatitude ? parseFloat(order.dropoffLatitude) : undefined}
                  dropoffLng={order.dropoffLongitude ? parseFloat(order.dropoffLongitude) : undefined}
                  driverLat={currentLocation?.lat}
                  driverLng={currentLocation?.lng}
                  status={order.status}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                        {order.pickedUpAt && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Picked Up
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">{order.pickupAddress}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.pickupContactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${order.pickupContactPhone}`} className="text-primary hover:underline">
                            {order.pickupContactPhone}
                          </a>
                        </div>
                      </div>

                      {order.pickupInstructions && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {order.pickupInstructions}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="relative pl-8 pt-6">
                    <div className="absolute left-0 top-6 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Delivery Location
                        </p>
                        {order.deliveredAt && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Delivered
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">{order.dropoffAddress}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.dropoffContactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${order.dropoffContactPhone}`} className="text-primary hover:underline">
                            {order.dropoffContactPhone}
                          </a>
                        </div>
                      </div>

                      {order.dropoffInstructions && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {order.dropoffInstructions}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          const isCurrent = order.status === event.status && !event.timestamp;
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
                                      Current Status
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
                      {trackingEvents && trackingEvents.length > 0 ? (
                        <div className="space-y-3">
                          {trackingEvents.map((event) => (
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

                                      <div className="space-y-6">
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
                                              <p className="font-medium">{order.packageDescription}</p>
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Box className="h-3 w-3" />
                                                  <span>Size</span>
                                                </div>
                                                <p className="font-semibold capitalize">{order.packageSize || "N/A"}</p>
                                              </div>
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                  <Weight className="h-3 w-3" />
                                                  <span>Weight</span>
                                                </div>
                                                <p className="font-semibold">{order.packageWeight ? `${order.packageWeight} kg` : "N/A"}</p>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Quantity</p>
                                                <p className="font-semibold">{order.packageQuantity} item(s)</p>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Value</p>
                                                <p className="font-semibold">{order.packageValue ? `${order.currency} ${order.packageValue}` : "N/A"}</p>
                                              </div>
                                            </div>

                                            {order.isFragile && (
                                              <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                <AlertTitle className="text-orange-900 dark:text-orange-300">Fragile Item</AlertTitle>
                                                <AlertDescription className="text-orange-800 dark:text-orange-400">
                                                  This package requires special handling
                                                </AlertDescription>
                                              </Alert>
                                            )}

                                            {order.requiresSignature && (
                                              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <AlertTitle className="text-blue-900 dark:text-blue-300">Signature Required</AlertTitle>
                                                <AlertDescription className="text-blue-800 dark:text-blue-400">
                                                  Get recipient signature upon delivery
                                                </AlertDescription>
                                              </Alert>
                                            )}

                                            {order.specialInstructions && (
                                              <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Special Instructions</AlertTitle>
                                                <AlertDescription>{order.specialInstructions}</AlertDescription>
                                              </Alert>
                                            )}
                                          </CardContent>
                                        </Card>

                                        <Card className="shadow-lg">
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <DollarSign className="h-5 w-5" />
                                              Earnings Breakdown
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center py-2">
                                                <span className="text-muted-foreground">Total Order Cost</span>
                                                <span className="font-semibold">{order.currency} {Number(order.totalCost).toFixed(2)}</span>
                                              </div>

                                              <div className="flex justify-between items-center py-2">
                                                <span className="text-muted-foreground">Platform Fee</span>
                                                <span className="font-semibold">{order.currency} {Number(order.platformFee).toFixed(2)}</span>
                                              </div>

                                              <Separator />

                                              <div className="flex justify-between items-center py-2 bg-green-500/10 rounded-lg px-3">
                                                <span className="font-bold text-green-700 dark:text-green-400">Your Earnings</span>
                                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                  {order.currency} {Number(order.deliveryFee).toFixed(2)}
                                                </span>
                                              </div>
                                            </div>

                                            {(order.estimatedDistance || order.estimatedDuration) && (
                                              <div className="pt-4 space-y-2 border-t">
                                                {order.estimatedDistance && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Estimated Distance</span>
                                                    <span className="font-medium">{Number(order.estimatedDistance).toFixed(2)} km</span>
                                                  </div>
                                                )}
                                                {order.estimatedDuration && (
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Estimated Duration</span>
                                                    <span className="font-medium">{order.estimatedDuration} mins</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>

                                        {canAccept && (
                                          <Card className="shadow-lg border-primary">
                                            <CardHeader className="bg-primary/5">
                                              <CardTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Accept This Order
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                              <p className="text-sm text-muted-foreground">
                                                By accepting this order, you commit to picking up and delivering the package as described.
                                              </p>
                                              <Button
                                                onClick={handleAcceptOrder}
                                                disabled={acceptOrderMutation.isPending}
                                                className="w-full"
                                                size="lg"
                                              >
                                                {acceptOrderMutation.isPending ? (
                                                  <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Accepting...
                                                  </>
                                                ) : (
                                                  <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Accept Order
                                                  </>
                                                )}
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {canPickup && (
                                          <Card className="shadow-lg border-blue-500">
                                            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                                              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                                                <Package className="h-5 w-5" />
                                                Mark as Picked Up
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                              <p className="text-sm text-muted-foreground">
                                                Mark this order as picked up once you have collected the package from the sender.
                                              </p>
                                              <Button
                                                onClick={() => setShowPickupDialog(true)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                size="lg"
                                              >
                                                <Package className="h-4 w-4 mr-2" />
                                                Mark as Picked Up
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {canMarkInTransit && (
                                          <Card className="shadow-lg border-purple-500">
                                            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                                              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
                                                <Truck className="h-5 w-5" />
                                                Mark as In Transit
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                              <p className="text-sm text-muted-foreground">
                                                Update the status to in transit when you start heading to the delivery location.
                                              </p>
                                              <Button
                                                onClick={() => setShowTransitDialog(true)}
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                                size="lg"
                                              >
                                                <Truck className="h-4 w-4 mr-2" />
                                                Mark as In Transit
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {canDeliver && (
                                          <Card className="shadow-lg border-green-500">
                                            <CardHeader className="bg-green-50 dark:bg-green-900/20">
                                              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Mark as Delivered
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                              <p className="text-sm text-muted-foreground">
                                                Complete this delivery by confirming the package has been delivered to the recipient.
                                              </p>
                                              <Button
                                                onClick={() => setShowDeliveryDialog(true)}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                size="lg"
                                              >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Mark as Delivered
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {order.status === "delivered" && (
                                          <Card className="shadow-lg border-green-200 dark:border-green-800">
                                            <CardHeader className="bg-green-50 dark:bg-green-900/20">
                                              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-300">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Delivery Complete
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-4">
                                              {order.deliveredAt && (
                                                <div className="space-y-1">
                                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivered At</p>
                                                  <p className="font-semibold">{format(new Date(order.deliveredAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                                                </div>
                                              )}

                                              {order.recipientName && (
                                                <div className="space-y-1">
                                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Received By</p>
                                                  <p className="font-semibold">{order.recipientName}</p>
                                                </div>
                                              )}

                                              {order.deliveryNotes && (
                                                <div className="space-y-1">
                                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                                                  <p className="font-medium text-sm">{order.deliveryNotes}</p>
                                                </div>
                                              )}

                                              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertDescription className="text-green-800 dark:text-green-400">
                                                  You earned {order.currency} {Number(order.deliveryFee).toFixed(2)} from this delivery!
                                                </AlertDescription>
                                              </Alert>

                                              <Button onClick={() => router.push("/driver/deliver")} className="w-full" size="lg">
                                                View More Orders
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        )}

                                        <Card className="shadow-lg">
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <MessageCircle className="h-5 w-5" />
                                              Quick Actions
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <Button
                                              variant="outline"
                                              className="w-full justify-between group"
                                              size="lg"
                                              onClick={() => window.open(`tel:${order.pickupContactPhone}`)}
                                            >
                                              <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Call Pickup Contact
                                              </span>
                                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-between group"
                                              size="lg"
                                              onClick={() => window.open(`tel:${order.dropoffContactPhone}`)}
                                            >
                                              <span className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Call Delivery Contact
                                              </span>
                                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-between group"
                                              size="lg"
                                              onClick={getCurrentLocation}
                                              disabled={updateLocationMutation.isPending}
                                            >
                                              <span className="flex items-center gap-2">
                                                <Navigation className="h-4 w-4" />
                                                {updateLocationMutation.isPending ? "Updating..." : "Update My Location"}
                                              </span>
                                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </div>
                                  </div>

                                  <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Mark Order as Picked Up</DialogTitle>
                                        <DialogDescription>
                                          Confirm that you have collected the package from the pickup location.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="pickupNotes">Pickup Notes (Optional)</Label>
                                          <Textarea
                                            id="pickupNotes"
                                            placeholder="Any notes about the pickup (condition, issues, etc.)"
                                            value={pickupNotes}
                                            onChange={(e) => setPickupNotes(e.target.value)}
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowPickupDialog(false)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleMarkAsPickedUp}
                                          disabled={markAsPickedUpMutation.isPending}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          {markAsPickedUpMutation.isPending ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Updating...
                                            </>
                                          ) : (
                                            <>
                                              <Package className="h-4 w-4 mr-2" />
                                              Confirm Pickup
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog open={showTransitDialog} onOpenChange={setShowTransitDialog}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Mark Order as In Transit</DialogTitle>
                                        <DialogDescription>
                                          Update the status to show you are heading to the delivery location.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="transitNotes">Transit Notes (Optional)</Label>
                                          <Textarea
                                            id="transitNotes"
                                            placeholder="Any notes about the transit (route, conditions, etc.)"
                                            value={transitNotes}
                                            onChange={(e) => setTransitNotes(e.target.value)}
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowTransitDialog(false)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleMarkAsInTransit}
                                          disabled={markAsInTransitMutation.isPending}
                                          className="bg-purple-600 hover:bg-purple-700"
                                        >
                                          {markAsInTransitMutation.isPending ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Updating...
                                            </>
                                          ) : (
                                            <>
                                              <Truck className="h-4 w-4 mr-2" />
                                              Confirm In Transit
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog open={showDeliveryDialog} onOpenChange={handleDeliveryDialogClose}>
                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <Shield className="h-5 w-5 text-green-600" />
                                          Mark Order as Delivered
                                        </DialogTitle>
                                        <DialogDescription>
                                          Verify delivery with OTP sent to the recipient.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        {!otpSent ? (
                                          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <AlertTitle className="text-blue-900 dark:text-blue-300">OTP Verification Required</AlertTitle>
                                            <AlertDescription className="text-blue-800 dark:text-blue-400">
                                              Send an OTP to the recipient ({order.dropoffContactPhone}) to verify delivery.
                                            </AlertDescription>
                                          </Alert>
                                        ) : (
                                          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <AlertTitle className="text-green-900 dark:text-green-300">OTP Sent Successfully</AlertTitle>
                                            <AlertDescription className="text-green-800 dark:text-green-400">
                                              A 6-digit code has been sent to {order.dropoffContactPhone}. Ask the recipient for the code.
                                            </AlertDescription>
                                          </Alert>
                                        )}

                                        {!otpSent ? (
                                          <Button
                                            onClick={handleSendOtp}
                                            disabled={sendOtpMutation.isPending}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            size="lg"
                                          >
                                            {sendOtpMutation.isPending ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending OTP...
                                              </>
                                            ) : (
                                              <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send OTP to Recipient
                                              </>
                                            )}
                                          </Button>
                                        ) : (
                                          <>
                                            <div className="space-y-2">
                                              <Label htmlFor="otp">Verification Code *</Label>
                                              <Input
                                                id="otp"
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => {
                                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                  setOtp(value);
                                                }}
                                                maxLength={6}
                                                className="text-center text-2xl tracking-widest font-mono"
                                              />
                                              <p className="text-xs text-muted-foreground">
                                                Ask the recipient for the 6-digit code sent to their phone
                                              </p>
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="recipientName">Recipient Name *</Label>
                                              <Input
                                                id="recipientName"
                                                placeholder="Who received the package?"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                                              <Textarea
                                                id="deliveryNotes"
                                                placeholder="Any notes about the delivery"
                                                value={deliveryNotes}
                                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                                rows={3}
                                              />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                              <Button
                                                variant="outline"
                                                onClick={handleSendOtp}
                                                disabled={sendOtpMutation.isPending}
                                                className="flex-1"
                                              >
                                                {sendOtpMutation.isPending ? (
                                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                  <Send className="h-4 w-4 mr-2" />
                                                )}
                                                Resend OTP
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => handleDeliveryDialogClose(false)}>
                                          Cancel
                                        </Button>
                                        {otpSent && (
                                          <Button
                                            onClick={handleMarkAsDelivered}
                                            disabled={
                                              markAsDeliveredMutation.isPending ||
                                              !recipientName.trim() ||
                                              otp.length !== 6
                                            }
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            {markAsDeliveredMutation.isPending ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Verifying...
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Confirm Delivery
                                              </>
                                            )}
                                          </Button>
                                        )}
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Report an Issue</DialogTitle>
                                        <DialogDescription>
                                          Let us know about any problems with this delivery. Support will be notified.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="issueType">Issue Type *</Label>
                                          <Select value={issueType} onValueChange={setIssueType}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select issue type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="address_not_found">Address Not Found</SelectItem>
                                              <SelectItem value="recipient_unavailable">Recipient Unavailable</SelectItem>
                                              <SelectItem value="package_damaged">Package Damaged</SelectItem>
                                              <SelectItem value="access_denied">Access Denied</SelectItem>
                                              <SelectItem value="weather_delay">Weather Delay</SelectItem>
                                              <SelectItem value="vehicle_issue">Vehicle Issue</SelectItem>
                                              <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="issueDescription">Description *</Label>
                                          <Textarea
                                            id="issueDescription"
                                            placeholder="Describe the issue in detail"
                                            value={issueDescription}
                                            onChange={(e) => setIssueDescription(e.target.value)}
                                            rows={4}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleReportIssue}
                                          disabled={reportIssueMutation.isPending || !issueType || !issueDescription.trim()}
                                          variant="destructive"
                                        >
                                          {reportIssueMutation.isPending ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Reporting...
                                            </>
                                          ) : (
                                            <>
                                              <Send className="h-4 w-4 mr-2" />
                                              Report Issue
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              );
                            }
