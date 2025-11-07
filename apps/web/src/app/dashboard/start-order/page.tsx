"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Package, User, Phone, Clock, AlertCircle, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  osm_type: string;
  osm_id: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

export default function StartOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");

  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

  const [dropoffContactName, setDropoffContactName] = useState("");
  const [dropoffContactPhone, setDropoffContactPhone] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [dropoffInstructions, setDropoffInstructions] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const [packageDescription, setPackageDescription] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [packageSize, setPackageSize] = useState<"small" | "medium" | "large">("medium");
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [packageValue, setPackageValue] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent" | "scheduled">("normal");
  const [isFragile, setIsFragile] = useState(false);
  const [scheduledPickupTime, setScheduledPickupTime] = useState("");

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const placeOrderMutation = useMutation(
    trpc.order.placeOrder.mutationOptions({
      onSuccess: (data) => {
        setOrderNumber(data.orderNumber);
        setStep(4);
        toast.success("Order placed successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to place order");
      },
    })
  );

  useEffect(() => {
    const loadDefaultLocations = async () => {
      try {
        const response = await fetch(
          `/api/geocode/autocomplete?input=Nairobi CBD`
        );
        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
          const suggestions = data.predictions.slice(0, 5).map((pred: any) => ({
            place_id: pred.place_id,
            osm_type: pred.osm_type,
            osm_id: pred.osm_id,
            description: pred.description,
            main_text: pred.main_text,
            secondary_text: pred.secondary_text,
          }));
          setPickupSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Error loading default locations:", error);
      }
    };

    loadDefaultLocations();
  }, []);

  const searchLocation = async (query: string, type: "pickup" | "dropoff") => {
    if (query.length < 3) {
      if (type === "pickup") {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      return;
    }

    try {
      const response = await fetch(
        `/api/geocode/autocomplete?input=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.predictions) {
        const suggestions = data.predictions.map((pred: any) => ({
          place_id: pred.place_id,
          osm_type: pred.osm_type,
          osm_id: pred.osm_id,
          description: pred.description,
          main_text: pred.main_text,
          secondary_text: pred.secondary_text,
        }));

        if (type === "pickup") {
          setPickupSuggestions(suggestions);
        } else {
          setDropoffSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const selectLocation = async (
    placeId: string,
    osmType: string,
    osmId: string,
    type: "pickup" | "dropoff"
  ) => {
    try {
      const response = await fetch(
        `/api/geocode/details?osm_type=${osmType}&osm_id=${osmId}`
      );
      const data = await response.json();

      if (data.result) {
        const location = data.result.geometry.location;
        const address = data.result.formatted_address;

        if (type === "pickup") {
          setPickupAddress(address);
          setPickupLat(location.lat);
          setPickupLng(location.lng);
          setPickupQuery(address);
          setShowPickupSuggestions(false);
          setPickupSuggestions([]);
        } else {
          setDropoffAddress(address);
          setDropoffLat(location.lat);
          setDropoffLng(location.lng);
          setDropoffQuery(address);
          setShowDropoffSuggestions(false);
          setDropoffSuggestions([]);
        }
      }
    } catch (error) {
      toast.error("Failed to get location details");
    }
  };

  const getCurrentLocation = (type: "pickup" | "dropoff") => {
    if ("geolocation" in navigator) {
      const loadingToast = toast.loading("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to fetch address");
            }

            const data = await response.json();

            if (data.results && data.results[0]) {
              const address = data.results[0].formatted_address;

              if (type === "pickup") {
                setPickupAddress(address);
                setPickupLat(latitude);
                setPickupLng(longitude);
                setPickupQuery(address);
              } else {
                setDropoffAddress(address);
                setDropoffLat(latitude);
                setDropoffLng(longitude);
                setDropoffQuery(address);
              }
              toast.dismiss(loadingToast);
              toast.success("Location found!");
            } else {
              throw new Error("No address found for this location");
            }
          } catch (error) {
            console.error("Geocoding error:", error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : "Failed to get address");
          }
        },
        (error) => {
          toast.dismiss(loadingToast);
          let errorMessage = "Unable to get your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocation is not supported");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupQuery && showPickupSuggestions) {
        searchLocation(pickupQuery, "pickup");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupQuery, showPickupSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropoffQuery && showDropoffSuggestions) {
        searchLocation(dropoffQuery, "dropoff");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropoffQuery, showDropoffSuggestions]);

  const validateStep1 = () => {
    if (!pickupContactName || !pickupContactPhone || !pickupAddress) {
      toast.error("Please fill all pickup details");
      return false;
    }
    if (pickupContactPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!dropoffContactName || !dropoffContactPhone || !dropoffAddress) {
      toast.error("Please fill all delivery details");
      return false;
    }
    if (dropoffContactPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!packageDescription || packageQuantity < 1) {
      toast.error("Please fill all package details");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) handleSubmit();
  };

  const handleSubmit = async () => {
    const loadingToast = toast.loading("Creating your order...");

    try {
      await placeOrderMutation.mutateAsync({
        pickupContactName,
        pickupContactPhone,
        pickupAddress,
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLng,
        pickupInstructions: pickupInstructions || undefined,
        dropoffContactName,
        dropoffContactPhone,
        dropoffAddress,
        dropoffLatitude: dropoffLat,
        dropoffLongitude: dropoffLng,
        dropoffInstructions: dropoffInstructions || undefined,
        packageDescription,
        packageWeight: packageWeight ? parseFloat(packageWeight) : undefined,
        packageSize,
        packageQuantity,
        packageValue: packageValue ? parseFloat(packageValue) : undefined,
        priority,
        isFragile,
        scheduledPickupTime: scheduledPickupTime ? new Date(scheduledPickupTime) : undefined,
      });
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
    }
  };

  const estimatedCost = priority === "urgent" ? 300 : 200;
  const platformFee = estimatedCost * 0.15;
  const totalCost = estimatedCost + platformFee;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Start New Order</h1>
          <p className="text-muted-foreground">
            Fill in the details to create your delivery order
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 mt-2 text-sm text-center">
            <span className={step >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
              Pickup
            </span>
            <span className={step >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
              Delivery
            </span>
            <span className={step >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
              Package
            </span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Pickup Details</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupName">Contact Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickupName"
                        placeholder="John Doe"
                        value={pickupContactName}
                        onChange={(e) => setPickupContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupPhone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickupPhone"
                        type="tel"
                        placeholder="0712345678"
                        value={pickupContactPhone}
                        onChange={(e) => setPickupContactPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <div className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        ref={pickupInputRef}
                        id="pickupLocation"
                        placeholder="Search for a location..."
                        value={pickupQuery}
                        onChange={(e) => {
                          setPickupQuery(e.target.value);
                          setShowPickupSuggestions(true);
                        }}
                        onFocus={() => setShowPickupSuggestions(true)}
                        className="pl-10 pr-12"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0 z-10"
                        onClick={() => getCurrentLocation("pickup")}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>

                    {showPickupSuggestions && pickupSuggestions.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1">
                        <CardContent className="p-2">
                          {pickupSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors"
                              onClick={() => selectLocation(
                                suggestion.place_id,
                                suggestion.osm_type,
                                suggestion.osm_id,
                                "pickup"
                              )}
                            >
                              <div className="font-medium">{suggestion.main_text}</div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.secondary_text}
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupInstructions">
                    Additional Instructions (Optional)
                  </Label>
                  <Textarea
                    id="pickupInstructions"
                    placeholder="E.g., Building name, floor number, gate code..."
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} size="lg">
                  Continue to Delivery Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Delivery Details</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dropoffName">Recipient Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dropoffName"
                        placeholder="Jane Smith"
                        value={dropoffContactName}
                        onChange={(e) => setDropoffContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoffPhone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dropoffPhone"
                        type="tel"
                        placeholder="0712345678"
                        value={dropoffContactPhone}
                        onChange={(e) => setDropoffContactPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffLocation">Delivery Location</Label>
                  <div className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        ref={dropoffInputRef}
                        id="dropoffLocation"
                        placeholder="Search for a location..."
                        value={dropoffQuery}
                        onChange={(e) => {
                          setDropoffQuery(e.target.value);
                          setShowDropoffSuggestions(true);
                        }}
                        onFocus={() => setShowDropoffSuggestions(true)}
                        className="pl-10 pr-12"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0 z-10"
                        onClick={() => getCurrentLocation("dropoff")}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>

                    {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                      <Card className="absolute z-50 w-full mt-1">
                        <CardContent className="p-2">
                          {dropoffSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors"
                              onClick={() => selectLocation(
                                suggestion.place_id,
                                suggestion.osm_type,
                                suggestion.osm_id,
                                "dropoff"
                              )}
                            >
                              <div className="font-medium">{suggestion.main_text}</div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.secondary_text}
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffInstructions">
                    Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="dropoffInstructions"
                    placeholder="E.g., Leave at reception, call on arrival..."
                    value={dropoffInstructions}
                    onChange={(e) => setDropoffInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleNext} size="lg">
                  Continue to Package Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Package Details</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageDescription">Package Description</Label>
                  <Textarea
                    id="packageDescription"
                    placeholder="What are you sending?"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageWeight">Weight (kg) - Optional</Label>
                    <Input
                      id="packageWeight"
                      type="number"
                      step="0.1"
                      placeholder="0.5"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packageValue">Value (KES) - Optional</Label>
                    <Input
                      id="packageValue"
                      type="number"
                      placeholder="5000"
                      value={packageValue}
                      onChange={(e) => setPackageValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Package Size</Label>
                  <RadioGroup value={packageSize} onValueChange={(v) => setPackageSize(v as any)}>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="small" className="mb-2" />
                        <Package className="h-6 w-6 mb-1" />
                        <span className="text-sm font-medium">Small</span>
                        <span className="text-xs text-muted-foreground">Up to 2kg</span>
                      </label>
                      <label className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="medium" className="mb-2" />
                        <Package className="h-8 w-8 mb-1" />
                        <span className="text-sm font-medium">Medium</span>
                        <span className="text-xs text-muted-foreground">Up to 10kg</span>
                      </label>
                      <label className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="large" className="mb-2" />
                        <Package className="h-10 w-10 mb-1" />
                        <span className="text-sm font-medium">Large</span>
                        <span className="text-xs text-muted-foreground">Over 10kg</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Priority</Label>
                  <RadioGroup value={priority} onValueChange={(v) => setPriority(v as any)}>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="normal" />
                        <div>
                          <div className="font-medium">Normal</div>
                          <div className="text-sm text-muted-foreground">KES 200</div>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="urgent" />
                        <div>
                          <div className="font-medium">Urgent</div>
                          <div className="text-sm text-muted-foreground">KES 300</div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id="isFragile"
                    checked={isFragile}
                    onChange={(e) => setIsFragile(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isFragile" className="cursor-pointer">
                    Package is fragile (handle with care)
                  </Label>
                </div>
              </div>

              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>KES {estimatedCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Platform Fee</span>
                      <span>KES {platformFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>KES {totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  disabled={placeOrderMutation.isPending}
                >
                  {placeOrderMutation.isPending ? "Creating Order..." : "Place Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardContent className="p-8 text-center space-y-6">
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

              <div>
                <h2 className="text-2xl font-bold mb-2">Order Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your order has been placed and a rider will be assigned shortly.
                </p>
              </div>

              <Card className="bg-muted text-left">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="text-lg font-bold">{orderNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium truncate">{pickupContactName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium truncate">{dropoffContactName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push(`/dashboard`)}
                >
                  View Order Details
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Place Another Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
