"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CreditCard,
  Banknote,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventService } from "@/lib/services/event.service";
import { clientService } from "@/lib/services/client.service";
import { inventoryService } from "@/lib/services/inventory.service";
import { saleService } from "@/lib/services/sale.service";
const upcomingEventsPlaceholder = [
  {
    id: 1,
    client_name: "Garcia Wedding",
    venue_name: "Villa Rosemary",
    date: "Dec 15, 2026",
    status: "Confirmed"
  }
];
const recentSalesPlaceholder = [
  {
    id: 1,
    event_name: "Garcia Wedding",
    total_amount: 12500,
    payment_method: "Card",
    created_at: "Dec 10, 2026"
  }
];
const statusColors = {
  Lead: "bg-[#8b5cf6]/15 text-[#8b5cf6]",
  Confirmed: "bg-[#0ea5e9]/15 text-[#0ea5e9]",
  Finished: "bg-[#f472b6]/15 text-[#f472b6]",
  Cancelled: "bg-[#fb7185]/15 text-[#fb7185]"
};
const paymentIcons = {
  Cash: <Banknote className="h-4 w-4 text-[#38bdf8]" />,
  Card: <CreditCard className="h-4 w-4 text-[#8b5cf6]" />,
  Transfer: <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />
};
export function DashboardView() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    activeClients: 0,
    lowStockAlerts: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [eventsRes, clientsRes, inventoryRes, salesRes] = await Promise.all([
          eventService.getAll(),
          clientService.getAll(),
          inventoryService.getLowStockItems(),
          saleService.getAll()
        ]);
        const getArray = (resPayload) => {
          if (!resPayload) return [];
          if (Array.isArray(resPayload)) return resPayload;
          if (Array.isArray(resPayload.data)) return resPayload.data;
          return [];
        };
        const eventsList = getArray(eventsRes.data);
        const clientsList = getArray(clientsRes.data);
        const inventoryList = getArray(inventoryRes.data);
        const salesList = getArray(salesRes.data);
        const totalEvents = eventsList.length;
        const activeClients = clientsList.filter((c) => c.status === "Active").length;
        const lowStockAlerts = inventoryList.length;
        const totalRevenue = salesList.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0);
        setStats({
          totalEvents,
          totalRevenue,
          activeClients,
          lowStockAlerts
        });
        const upcomingRes = await eventService.getUpcoming(5);
        setUpcomingEvents(getArray(upcomingRes.data));
        const recentRes = await saleService.getRecent(5);
        setRecentSales(getArray(recentRes.data));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMsg);
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  const kpiData = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      change: "+12%",
      icon: Calendar,
      color: "bg-[#8b5cf6]"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "bg-[#0ea5e9]"
    },
    {
      title: "Active Clients",
      value: stats.activeClients,
      change: "+5%",
      icon: Users,
      color: "bg-[#f472b6]"
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockAlerts,
      change: "-3",
      icon: AlertTriangle,
      color: "bg-[#facc15]"
    }
  ];
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>;
  }
  if (error) {
    return <div className="rounded-3xl border border-red-500/20 bg-red-950/60 p-4 text-red-100 shadow-[0_15px_40px_-30px_rgba(251,113,133,0.85)]">
        <p>Error loading dashboard: {error}</p>
      </div>;
  }
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s an overview of your event agency.
        </p>
      </div>

      {
    /* KPI Cards */
  }
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => <Card
    key={kpi.title}
    className="overflow-hidden rounded-2xl border-none shadow-md transition-shadow hover:shadow-lg"
  >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-sm text-[#6b705c]">{kpi.change} from last month</p>
                </div>
                <div
    className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.color}`}
  >
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {
    /* Main Content Grid */
  }
      <div className="grid gap-6 lg:grid-cols-3">
        {
    /* Next Events */
  }
        <Card className="rounded-2xl border-none shadow-md lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Calendar className="h-5 w-5 text-[#8b5cf6]" />
              Next Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming events</p> : <div className="space-y-3">
                {upcomingEvents.map((event) => <div
    key={event.id}
    className="flex items-center justify-between rounded-3xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted/60 shadow-[0_8px_40px_-28px_rgba(139,92,246,0.45)]"
  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6]/15">
                        <Calendar className="h-5 w-5 text-[#8b5cf6]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.venue_name || event.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <span
    className={`rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium ${statusColors[event.status] || "bg-muted text-muted-foreground"}`}
  >
                        {event.status}
                      </span>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {
    /* Recent Sales */
  }
        <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <DollarSign className="h-5 w-5 text-[#6b705c]" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? <p className="text-sm text-muted-foreground">No recent sales</p> : <div className="space-y-4">
                {recentSales.map((sale) => <div
    key={sale.id}
    className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
  >
                    <div>
                      <p className="font-medium text-foreground">{sale.event_name || "Event"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1 text-sm text-foreground shadow-sm shadow-[#8b5cf6]/10">
                        {paymentIcons[sale.payment_method] || paymentIcons["Card"]}
                        <span className="text-xs font-medium text-foreground">
                          {sale.payment_method}
                        </span>
                      </div>
                      <p className="font-semibold text-[#8b5cf6]">
                        ${sale.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}
