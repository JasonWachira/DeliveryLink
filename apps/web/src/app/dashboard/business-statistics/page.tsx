"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {

  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
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

const chartConfig = {
  totalOrders: {
    label: "Total Orders",
    color: "hsl(var(--chart-1))",
  },
  deliveredOrders: {
    label: "Delivered",
    color: "hsl(var(--chart-2))",
  },
  totalSpent: {
    label: "Total Spent",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function BusinessStatisticsPage() {
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

  const myBusinessStats = useQuery(
    trpc.statistics.getMyBusinessStatistics.queryOptions({
      startDate,
      endDate
    })
  )

  const aggregateStats = useQuery(
    trpc.statistics.getBusinessAggregateStatistics.queryOptions({
      startDate,
      endDate
    })
  )

  const todayStats = useQuery(
    trpc.statistics.getBusinessTodayStatistics.queryOptions()
  )

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const chartData = React.useMemo(() => {
    if (!myBusinessStats.data) return []

    return myBusinessStats.data.map(stat => ({
      date: stat.date,
      totalOrders: stat.totalOrders,
      deliveredOrders: stat.deliveredOrders,
      spent: parseFloat(stat.totalSpent)
    })).reverse()
  }, [myBusinessStats.data])

  if (myBusinessStats.isLoading || aggregateStats.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading business statistics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Statistics</h1>
          <p className="text-muted-foreground">Your delivery platform performance and spending</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.data?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">{todayStats.data?.deliveredOrders || 0} delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {todayStats.data?.totalSpent || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Fees: KES {todayStats.data?.totalPlatformFees || "0.00"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.data?.inTransitOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Currently being delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.data?.cancelledOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Orders & Spending Overview</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">Your orders and spending for the selected period</span>
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
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
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
                  />
                }
              />
              <Area
                dataKey="deliveredOrders"
                type="natural"
                fill="url(#fillDelivered)"
                stroke="hsl(var(--chart-2))"
                stackId="a"
              />
              <Area
                dataKey="totalOrders"
                type="natural"
                fill="url(#fillOrders)"
                stroke="hsl(var(--chart-1))"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>Aggregate statistics for selected period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <span className="font-bold text-lg">{aggregateStats.data?.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Delivered</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{aggregateStats.data?.totalDelivered || 0}</span>
                <Badge variant="outline">{aggregateStats.data?.deliveryRate || "0.00"}%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cancelled</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{aggregateStats.data?.totalCancelled || 0}</span>
                <Badge variant="outline">{aggregateStats.data?.cancellationRate || "0.00"}%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="font-bold text-lg">KES {aggregateStats.data?.totalSpent || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform Fees</span>
              <span className="font-medium">KES {aggregateStats.data?.totalPlatformFees || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Delivery Fees</span>
              <span className="font-medium">KES {aggregateStats.data?.totalDeliveryFees || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Avg Order Value</span>
              <span className="font-medium">KES {aggregateStats.data?.avgOrderValue || "0.00"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Breakdown</CardTitle>
            <CardDescription>Detailed order statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">By Priority</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Urgent</span>
                  <span className="font-medium">{aggregateStats.data?.urgentOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Normal</span>
                  <span className="font-medium">{aggregateStats.data?.normalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="font-medium">{aggregateStats.data?.scheduledOrders || 0}</span>
                  </div>
                  </div>
                  </div>
                  <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">By Package Size</p>
                  <div className="space-y-2">
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Small</span>
                  <span className="font-medium">{aggregateStats.data?.smallPackages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Medium</span>
                  <span className="font-medium">{aggregateStats.data?.mediumPackages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Large</span>
                  <span className="font-medium">{aggregateStats.data?.largePackages || 0}</span>
                  </div>
                  </div>
                  </div>
                  <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Special Handling</p>
                  <div className="space-y-2">
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fragile Packages</span>
                  <span className="font-medium">{aggregateStats.data?.fragilePackages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Package Value</span>
                  <span className="font-medium">KES {aggregateStats.data?.totalPackageValue || "0.00"}</span>
                  </div>
                  </div>
                  </div>
                  </CardContent>
                  </Card>
                  </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Daily Statistics</CardTitle>
                        <CardDescription>Daily breakdown of your orders</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {myBusinessStats.data?.slice(0, 7).map((stat) => (
                            <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <p className="font-medium">{new Date(stat.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  <span>Orders: {stat.totalOrders}</span>
                                  <span>Delivered: {stat.deliveredOrders}</span>
                                  <span>Cancelled: {stat.cancelledOrders}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">KES {stat.totalSpent}</p>
                                <p className="text-xs text-muted-foreground">Fees: KES {stat.totalPlatformFees}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  )
                  }
