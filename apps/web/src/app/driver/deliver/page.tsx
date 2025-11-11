"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, MapPin, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function DeliverPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const availableOrders = useQuery(
    trpc.driver.getAvailableOrders.queryOptions({
      limit: 50,
      offset: 0
    })
  )





  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'normal':
        return 'default'
      case 'scheduled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (availableOrders.isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Orders</h1>
          <p className="text-muted-foreground">Accept orders to start delivering</p>
        </div>
        <div>
          <Button onClick={() =>router.push(`/driver/dashboard`)}>
            Driver Dashboard
          </Button>
        </div>
      </div>

      {availableOrders.data?.hasActiveDelivery && availableOrders.data.activeDelivery && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Delivery in Progress
            </CardTitle>
            <CardDescription>Complete your current delivery before accepting new orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{availableOrders.data.activeDelivery.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {availableOrders.data.activeDelivery.packageDescription}
                </p>
              </div>
              <Button onClick={() => router.push(`/driver/deliver/${availableOrders.data.activeDelivery?.orderId}`)}>
                Continue Delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!availableOrders.data?.canAcceptOrders && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium">
                You cannot accept new orders while you have an active delivery. Please complete your current delivery first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {availableOrders.data?.total || 0} available orders
        </div>
      </div>

      <div className="space-y-4">
        {availableOrders.data?.availableOrders.map((order) => (
          <Card key={order.orderId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                    <Badge variant="secondary">
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={getPriorityColor(order.priority)}>
                      {order.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Posted {new Date(order.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold text-lg text-green-600">
                    <DollarSign className="h-4 w-4" />
                    KES {order.deliveryFee}
                  </div>
                  <p className="text-xs text-muted-foreground">You will earn</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact: {order.pickupContactName} ({order.pickupContactPhone})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Dropoff Location</p>
                      <p className="text-sm text-muted-foreground">{order.dropoffAddress}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact: {order.dropoffContactName} ({order.dropoffContactPhone})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{order.packageDescription}</span>
                </div>
                <Badge variant="outline">{order.packageSize}</Badge>
                {order.isFragile && (
                  <Badge variant="destructive">Fragile</Badge>
                )}
                {/*{order.requiresSignature && (
                  <Badge variant="secondary">Signature Required</Badge>
                )}*/}
              </div>

              {/*{order.specialInstructions && (
                <div className="py-3 border-b">
                  <p className="text-sm font-medium mb-1">Special Instructions:</p>
                  <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
                </div>
              )}*/}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Cost</p>
                  <p className="font-semibold">KES {order.totalCost}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Platform Fee</p>
                  <p className="font-semibold">KES {order.platformFee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Package Value</p>
                  <p className="font-semibold">KES {order.packageValue || '0.00'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Distance</p>
                  <p className="font-semibold">{order.actualDistance} km</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated {order.estimatedDuration} mins</span>
                </div>
                <Button

                  size="lg"
                  onClick={() => router.push(`/driver/deliver/${order.orderId}`)}
                >

                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Order


                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!availableOrders.data?.availableOrders || availableOrders.data.availableOrders.length === 0) && availableOrders.data?.canAcceptOrders && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No available orders</h3>
                <p className="text-muted-foreground mb-4">
                  There are no orders available for pickup at the moment. Check back soon!
                </p>
                <Button onClick={() => availableOrders.refetch()} variant="outline">
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
