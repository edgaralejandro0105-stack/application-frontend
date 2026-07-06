import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientPortalService } from "@/lib/services/client-portal.service";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusColors = {
  Pending: "bg-amber-500/10 text-amber-500", Confirmed: "bg-emerald-500/10 text-emerald-500",
  "On Hold": "bg-blue-500/10 text-blue-500", Finished: "bg-slate-500/10 text-slate-500",
  Cancelled: "bg-red-500/10 text-red-500", Lead: "bg-purple-500/10 text-purple-500",
};

const statusLabels = {
  Pending: "Pendiente", Confirmed: "Confirmado", "On Hold": "En Espera",
  Finished: "Finalizado", Cancelled: "Cancelado", Lead: "Prospecto",
};

export function PortalEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sendingRating, setSendingRating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await clientPortalService.getEventDetail(id);
      if (res.error) {
        toast.error("Error al cargar el evento");
        navigate("/portal");
        return;
      }
      setEvent(res.data?.data || res.data);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const handleSubmitRating = async () => {
    if (rating === 0) { toast.error("Selecciona una puntuación"); return; }
    setSendingRating(true);
    try {
      const res = await clientPortalService.submitRating(id, { rating, comment });
      if (res.error) { toast.error(res.error); return; }
      toast.success("Calificación enviada. ¡Gracias!");
      setRating(0);
      setComment("");
    } catch { toast.error("Error al enviar calificación"); }
    finally { setSendingRating(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/portal")} className="rounded-xl">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis eventos
      </Button>

      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <span className={`inline-block mt-2 rounded-full px-3 py-1 text-xs font-medium ${statusColors[event.status] || "bg-muted text-muted-foreground"}`}>
                {statusLabels[event.status] || event.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha del evento</p>
                  <p className="font-medium">
                    {new Date(event.start_date || event.date).toLocaleDateString("es-ES", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
              </div>
              {event.Venue?.name && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lugar</p>
                    <p className="font-medium">{event.Venue.name}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Invitados</p>
                  <p className="font-medium">{event.guests || event.expected_guests || "Por definir"}</p>
                </div>
              </div>
              {event.Services && event.Services.length > 0 && (
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Servicios contratados</p>
                    <p className="font-medium">{event.Services.map(s => s.name).join(", ")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {event.status === "Finished" && (
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Califica tu experiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all ${star <= rating ? "text-amber-500 scale-110" : "text-muted-foreground/30 hover:text-amber-400"}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Cuéntanos cómo fue tu experiencia (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button onClick={handleSubmitRating} disabled={sendingRating} className="rounded-xl">
              {sendingRating ? "Enviando..." : "Enviar calificación"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
