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

const statusColors = {
  Lead: "bg-[#8b5cf6]/15 text-[#8b5cf6]",
  Pending: "bg-[#8b5cf6]/15 text-[#8b5cf6]",
  Confirmed: "bg-[#0ea5e9]/15 text-[#0ea5e9]",
  Finished: "bg-[#f472b6]/15 text-[#f472b6]",
  Cancelled: "bg-[#fb7185]/15 text-[#fb7185]"
};

const statusLabels = {
  Lead: "Prospecto",
  Pending: "Pendiente",
  Confirmed: "Confirmado",
  Finished: "Finalizado",
  Cancelled: "Cancelado"
};

const paymentIcons = {
  Efectivo: <Banknote className="h-4 w-4 text-[#38bdf8]" />,
  Card: <CreditCard className="h-4 w-4 text-[#8b5cf6]" />,
  Zelle: <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />,
  "Punto de Venta": <CreditCard className="h-4 w-4 text-[#8b5cf6]" />,
  Transferencia: <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />,
  "Pago Móvil": <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />
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

  const getSafeDate = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventsRes, clientsRes, inventoryRes, salesRes] = await Promise.all([
          eventService.getAll({ limit: 10000 }),
          clientService.getAll({ limit: 10000 }),
          inventoryService.getLowStockItems ? inventoryService.getLowStockItems() : Promise.resolve({ data: [] }),
          saleService.getAll({ limit: 10000 })
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
        const activeClients = clientsList.filter((c) => c.status === "Active" || !c.status).length;
        const lowStockAlerts = inventoryList.length;
        
        // El backend devuelve 'total' en lugar de 'total_amount'
        const totalRevenue = salesList.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);

        setStats({
          totalEvents,
          totalRevenue,
          activeClients,
          lowStockAlerts
        });

        // Próximos eventos manualmente mapeados usando la lógica correcta (start_date)
        const upcoming = eventsList
          .filter((e) => e.status !== "Finished" && e.status !== "Cancelled")
          .sort((a, b) => getSafeDate(a.start_date || a.date).getTime() - getSafeDate(b.start_date || b.date).getTime())
          .slice(0, 5);
        setUpcomingEvents(upcoming);

        // Ventas recientes (ordenadas por create_at)
        const recent = salesList
          .sort((a, b) => getSafeDate(b.create_at || b.createdAt).getTime() - getSafeDate(a.create_at || a.createdAt).getTime())
          .slice(0, 5);
        setRecentSales(recent);

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
      title: "Total Eventos",
      value: stats.totalEvents,
      change: "+12%",
      icon: Calendar,
      color: "bg-[#8b5cf6]"
    },
    {
      title: "Ingresos (Ventas)",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "bg-[#0ea5e9]"
    },
    {
      title: "Clientes Activos",
      value: stats.activeClients,
      change: "+5%",
      icon: Users,
      color: "bg-[#f472b6]"
    },
    {
      title: "Alertas de Inventario",
      value: stats.lowStockAlerts,
      change: "-3",
      icon: AlertTriangle,
      color: "bg-[#facc15]"
    }
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-950/60 p-4 text-red-100 shadow-[0_15px_40px_-30px_rgba(251,113,133,0.85)]">
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Panel de Control
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen general de La Casona.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <Card
              key={kpi.title}
              className="overflow-hidden rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {kpi.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Next Events */}
          <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-[#8b5cf6]" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/60">
                  <Calendar className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No hay eventos próximos en la base de datos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.event_id || event.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-muted/60 shadow-[0_8px_40px_-28px_rgba(139,92,246,0.45)] hover:shadow-[0_12px_40px_-20px_rgba(139,92,246,0.55)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/20">
                          <span className="text-xs font-bold uppercase text-[#8b5cf6]">
                            {getSafeDate(event.start_date || event.date).toLocaleString('es', { month: 'short' })}
                          </span>
                          <span className="text-lg font-black leading-none text-[#8b5cf6]">
                            {getSafeDate(event.start_date || event.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-base">
                            {event.name || `${event.type_event || 'Evento'} de ${event.Client?.name || 'Cliente'}`}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">
                            {event.Venues && event.Venues.length > 0 ? event.Venues.map(v => v.name).join(', ') : (event.Venue?.name || event.venue_name || "Sin Salón")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold shadow-sm ${statusColors[event.status || 'Pending'] || "bg-muted text-muted-foreground"}`}
                        >
                          {statusLabels[event.status || 'Pending'] || event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <DollarSign className="h-5 w-5 text-[#6b705c]" />
                Ventas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/60">
                  <DollarSign className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No hay ventas registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.sale_id || sale.id}
                      className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {sale.Event?.name || `Evento #${sale.event_id || 'N/A'}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getSafeDate(sale.create_at || sale.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <p className="font-bold text-[#8b5cf6] text-lg leading-none">
                          ${Number(sale.total || sale.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        {sale.payment_method && (
                          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-0.5 text-xs text-foreground shadow-sm shadow-[#8b5cf6]/10">
                            {paymentIcons[sale.payment_method] || paymentIcons["Card"]}
                            <span className="font-medium text-muted-foreground">
                              {sale.payment_method}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-8 border-2 border-red-500 bg-red-100 rounded-2xl m-8">
        <h2 className="text-red-700 font-bold text-xl mb-4">Error Crítico en Renderizado</h2>
        <pre className="text-red-900 bg-red-200 p-4 rounded-xl overflow-x-auto">
          {err.message}
          <br/>
          {err.stack}
        </pre>
      </div>
    );
  }
}
