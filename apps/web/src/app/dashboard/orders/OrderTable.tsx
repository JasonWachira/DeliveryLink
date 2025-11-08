"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  XCircle,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
  assigned: {
    label: "Assigned",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Truck,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Package,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: PackageCheck,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

const priorityConfig = {
  urgent: {
    label: "Urgent",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  normal: {
    label: "Normal",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const ordersQuery = useQuery(
    trpc.order.getMyOrders.queryOptions({
      limit: pageSize,
      offset: page * pageSize,
      status: statusFilter === "all" ? undefined : statusFilter,
    })
  );

  const statsQuery = useQuery(
    trpc.order.getOrderStats.queryOptions()
  );
  console.log(statsQuery.data);
  const cancelOrder = useMutation(
    trpc.order.cancelOrder.mutationOptions({
      onSuccess: () => {
        ordersQuery.refetch();
        statsQuery.refetch();
      },
    })
  );

  const filteredOrders = ordersQuery.data?.orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.packageDescription.toLowerCase().includes(query) ||
      order.dropoffAddress.toLowerCase().includes(query) ||
      order.pickupAddress.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil((ordersQuery.data?.total || 0) / pageSize);

  const handleCancelOrder = async (orderId: number) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      await cancelOrder.mutateAsync({
        orderId,
        reason: "Cancelled by customer",
      });
      ordersQuery.refetch();
      statsQuery.refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your delivery orders
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-3xl">{statsQuery.data?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {statsQuery.data?.completed || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {statsQuery.data?.active || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Spent</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                KES {statsQuery.data?.totalSpent || "0.00"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">All Orders</CardTitle>
                <CardDescription>
                  A list of all your delivery orders and their status
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push("/dashboard/start-order")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Package className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by number, description, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Order #</TableHead>
                    <TableHead className="font-semibold">Package</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Cost</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-muted-foreground">
                            Loading orders...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const StatusIcon =
                        statusConfig[order.status as keyof typeof statusConfig]
                          ?.icon || Package;
                      return (
                        <TableRow
                          key={order.orderId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-blue-600">
                                {order.orderNumber}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                {order.packageDescription}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                {order.packageSize && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {order.packageSize}
                                  </Badge>
                                )}
                                {order.isFragile && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    Fragile
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 max-w-xs">
                              <p className="text-sm font-medium truncate">
                                {order.pickupAddress}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                → {order.dropoffAddress}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                statusConfig[
                                  order.status as keyof typeof statusConfig
                                ]?.color
                              } border flex items-center space-x-1 w-fit`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span>
                                {
                                  statusConfig[
                                    order.status as keyof typeof statusConfig
                                  ]?.label
                                }
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                priorityConfig[
                                  order.priority as keyof typeof priorityConfig
                                ]?.color
                              } border`}
                            >
                              {
                                priorityConfig[
                                  order.priority as keyof typeof priorityConfig
                                ]?.label
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            KES {parseFloat(order.totalCost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDistanceToNow(new Date(order.createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/*<DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/orders/${order.orderId}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>*/}
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/track/${order.orderId}`)
                                  }
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                  Track Order
                                </DropdownMenuItem>
                                {["pending", "confirmed", "assigned"].includes(
                                  order.status
                                ) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCancelOrder(order.orderId)
                                      }
                                      className="text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-2">
                          <Package className="h-12 w-12 text-gray-300" />
                          <p className="text-muted-foreground">
                            No orders found
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => router.push("/orders/new")}
                          >
                            Create your first order
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to{" "}
                {Math.min((page + 1) * pageSize, ordersQuery.data?.total || 0)} of{" "}
                {ordersQuery.data?.total || 0} orders
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {page + 1} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
