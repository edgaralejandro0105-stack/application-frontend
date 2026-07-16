"use client";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Wallet,
  Calendar,
  Search,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentService } from "@/lib/services/payment.service";

const methodIcons = {
  Efectivo: <Banknote className="h-4 w-4 text-[#38bdf8]" />,
  Card: <CreditCard className="h-4 w-4 text-[#8b5cf6]" />,
  Zelle: <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />,
  "Punto de Venta": <CreditCard className="h-4 w-4 text-[#8b5cf6]" />,
  Transferencia: <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />,
  "Pago Móvil": <ArrowRightLeft className="h-4 w-4 text-[#f472b6]" />
};

const methodColors = {
  Efectivo: "bg-[#38bdf8]/10 text-[#38bdf8]",
  Card: "bg-[#8b5cf6]/10 text-[#8b5cf6]",
  Zelle: "bg-[#f472b6]/10 text-[#f472b6]",
  "Punto de Venta": "bg-[#8b5cf6]/10 text-[#8b5cf6]",
  Transferencia: "bg-[#f472b6]/10 text-[#f472b6]",
  "Pago Móvil": "bg-[#f472b6]/10 text-[#f472b6]"
};

export function PaymentsView() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getAll({ page, limit: 15 });
      if (res.error) throw new Error(res.error);
      setPayments(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSafeDate = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const filteredPayments = search
    ? payments.filter(p => {
        const query = search.toLowerCase();
        const eventName = p.Sale?.Event?.title || "";
        const clientName = `${p.Sale?.Event?.Client?.name || ""} ${p.Sale?.Event?.Client?.last_name || ""}`;
        return eventName.toLowerCase().includes(query) || clientName.toLowerCase().includes(query) || p.method.toLowerCase().includes(query);
      })
    : payments;

  if (loading && payments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pagos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Pagos realizados desde la web y registro de transacciones.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por evento o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-950/60 p-4 text-red-100 shadow-[0_15px_40px_-30px_rgba(251,113,133,0.85)]">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && payments.length === 0 && !error && (
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No hay pagos registrados</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Los pagos de reservas web aparecerán aquí.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredPayments.map((payment) => {
          const sale = payment.Sale;
          const event = sale?.Event;
          const client = event?.Client;
          return (
            <Card
              key={payment.payment_id || payment.id}
              className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/40"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${methodColors[payment.method] || "bg-muted text-muted-foreground"}`}>
                      {methodIcons[payment.method] || <Wallet className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {payment.method || "Desconocido"}
                        </p>
                        {payment.simulated && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Web
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event?.title || `${event?.type_event || "Evento"} - ${client?.name || "Sin cliente"} ${client?.last_name || ""}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {getSafeDate(payment.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        {sale && (
                          <a
                            href={`/sales?sale=${sale.sale_id}`}
                            className="flex items-center gap-1 text-[#8b5cf6] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Factura #{String(sale.sale_id).padStart(5, "0")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-[#10b981]">
                      ${Number(payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${methodColors[payment.method] || "bg-muted text-muted-foreground"}`}>
                      {payment.method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-border bg-card/60 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground px-3">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-border bg-card/60 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
