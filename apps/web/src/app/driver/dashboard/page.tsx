"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, DollarSign, CheckCircle, XCircle, Clock, Truck } from "lucide-react"

const chartConfig = {
  totalEarnings: {
    label: "Total Earnings",
    color: "hsl(var(--chart-1))",
  },
  deliveries: {
    label: "Deliveries",
    color: "hsl(var(--chart-2))",
  },
  urgentDeliveries: {
    label: "Urgent",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function DriverDashboardPage() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  const getDateRange = () => {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()

    if (timeRange === "7d") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeRange === "30d") {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate.setDate(startDate.getDate() - 90)
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate
    }
  }

  const { startDate, endDate } = getDateRange()

  const driverStats = useQuery(
    trpc.driver.getDriverStats.queryOptions()
  )

  const currentDelivery = useQuery(
    trpc.driver.getCurrentDelivery.queryOptions()
  )

  const earningsSummary = useQuery(
    trpc.driver.getEarningsSummary.queryOptions({
      period: timeRange === "7d" ? "week" : timeRange === "30d" ? "month" : "all"
    })
  )

  const deliveryHistory = useQuery(
    trpc.driver.getDeliveryHistory.queryOptions({
      startDate,
      endDate,
      limit: 100,
      offset: 0
    })
  )

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const chartData = React.useMemo(() => {
    if (!deliveryHistory.data?.deliveries) return []

    const dailyData = new Map<string, { date: string; earnings: number; deliveries: number; urgent: number }>()

    deliveryHistory.data.deliveries.forEach(delivery => {
      const date = new Date(delivery.deliveredAt!).toISOString().split('T')[0]
      const existing = dailyData.get(date) || { date, earnings: 0, deliveries: 0, urgent: 0 }

      existing.earnings += parseFloat(delivery.deliveryFee)
      existing.deliveries += 1
      if (delivery.priority === 'urgent') {
        existing.urgent += 1
      }

      dailyData.set(date, existing)
    })

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [deliveryHistory.data])

  if (driverStats.isLoading || earningsSummary.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading driver dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
          <p className="text-muted-foreground">Your delivery performance and earnings</p>
        </div>
      </div>

      {currentDelivery.data && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Delivery
            </CardTitle>
            <CardDescription>You have an ongoing delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Number</span>
                <span className="font-bold">{currentDelivery.data.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={
                  currentDelivery.data.status === 'assigned' ? 'secondary' :
                  currentDelivery.data.status === 'picked_up' ? 'default' :
                  'outline'
                }>
                  {currentDelivery.data.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-medium">{currentDelivery.data.packageDescription}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivery Fee</span>
                <span className="font-bold text-lg">KES {currentDelivery.data.deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pickup</span>
                <span className="text-sm">{currentDelivery.data.pickupAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dropoff</span>
                <span className="text-sm">{currentDelivery.data.dropoffAddress}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverStats.data?.todayDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">
              KES {driverStats.data?.todayEarnings || "0.00"} earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {driverStats.data?.totalEarnings || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              {driverStats.data?.completed || 0} completed deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverStats.data?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverStats.data?.completionRate || "0"}%</div>
            <p className="text-xs text-muted-foreground">
              {driverStats.data?.total || 0} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Earnings & Deliveries Overview</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">Your earnings and delivery performance</span>
            <span className="@[540px]/card:hidden">Selected period</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
              <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
              >
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillDeliveries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                    formatter={(value, name) => {
                      if (name === "earnings") {
                        return `KES ${Number(value).toFixed(2)}`
                      }
                      return value
                    }}
                  />
                }
              />
              <Area
                dataKey="deliveries"
                type="natural"
                fill="url(#fillDeliveries)"
                stroke="hsl(var(--chart-2))"
                stackId="a"
              />
              <Area
                dataKey="earnings"
                type="natural"
                fill="url(#fillEarnings)"
                stroke="hsl(var(--chart-1))"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>Performance for selected period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Deliveries</span>
              <span className="font-bold text-lg">{earningsSummary.data?.totalDeliveries || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Urgent Deliveries</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{earningsSummary.data?.urgentDeliveries || 0}</span>
                <Badge variant="outline">
                  KES {earningsSummary.data?.urgentEarnings || "0.00"}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total Earnings</span>
              <span className="font-bold text-lg">KES {earningsSummary.data?.totalEarnings || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Per Delivery</span>
              <span className="font-medium">KES {earningsSummary.data?.averageEarningsPerDelivery || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Period</span>
              <Badge>{earningsSummary.data?.period || "all"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Breakdown</CardTitle>
            <CardDescription>Your delivery statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-bold">{driverStats.data?.completed || 0}</span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${driverStats.data?.completionRate || 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-bold">{driverStats.data?.active || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Orders</span>
                  <span className="font-bold text-lg">{driverStats.data?.total || 0}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lifetime Earnings</span>
                  <span className="font-bold text-lg">KES {driverStats.data?.totalEarnings || "0.00"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Your latest completed deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryHistory.data?.deliveries.slice(0, 10).map((delivery) => (
              <div key={delivery.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{delivery.orderNumber}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{delivery.packageDescription}</span>
                    {delivery.priority === 'urgent' && (
                      <Badge variant="destructive" className="h-5">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(delivery.deliveredAt!).toLocaleDateString("en-US", {
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
                  <p className="font-bold">KES {delivery.deliveryFee}</p>
                  <Badge variant="outline" className="mt-1">
                    {delivery.packageSize}
                  </Badge>
                </div>
              </div>
            ))}
            {(!deliveryHistory.data?.deliveries || deliveryHistory.data.deliveries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No completed deliveries yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
