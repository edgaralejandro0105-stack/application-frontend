import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clientPortalService } from "@/lib/services/client-portal.service";
import { Calendar, MapPin, Clock, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusColors = {
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "On Hold": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Finished: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  Lead: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const statusLabels = {
  Pending: "Pendiente", Confirmed: "Confirmado", "On Hold": "En Espera",
  Finished: "Finalizado", Cancelled: "Cancelado", Lead: "Prospecto",
};

export function PortalDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await clientPortalService.getEvents();
      if (!res.error) setEvents(res.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Eventos</h1>
        <p className="text-sm text-muted-foreground mt-1">Estos son tus eventos registrados con nosotros.</p>
      </div>

      {events.length === 0 ? (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No tienes eventos registrados</p>
            <p className="text-sm text-muted-foreground/70">Contáctanos para agendar tu próximo evento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card
              key={event.event_id || event.id}
              className="rounded-2xl border-border/50 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/portal/events/${event.event_id || event.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(event.start_date || event.date).toLocaleDateString("es-ES", {
                            year: "numeric", month: "long", day: "numeric"
                          })}
                        </span>
                        {event.Venue?.name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.Venue.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium border ${statusColors[event.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[event.status] || event.status}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
