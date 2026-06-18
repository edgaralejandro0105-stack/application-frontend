"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Users,
  Clock,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Building,
  Briefcase,
  UserPlus,
  Pencil,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventService } from "@/lib/services/event.service";
import { clientService } from "@/lib/services/client.service";
import { venueService } from "@/lib/services/venue.service";
import { employeeService } from "@/lib/services/employee.service";
import { serviceExternalService } from "@/lib/services/serviceExternal.service";
import { extractList } from "@/lib/api-client";
import { toast } from "sonner";

const statusColors = {
  Lead: "bg-[#d4a574] text-white",
  Pending: "bg-[#d4a574] text-white",
  'On Hold': "bg-amber-500 text-white",
  Confirmed: "bg-[#6b705c] text-white",
  Finished: "bg-[#1d3557] text-white",
  Cancelled: "bg-[#c05c3c] text-white"
};

const statusLabels = {
  Lead: "Lead",
  Pending: "Pendiente",
  'On Hold': "En Espera",
  Confirmed: "Confirmado",
  Finished: "Finalizado",
  Cancelled: "Cancelado"
};

const eventTypes = ["Boda", "Corporativo", "Bautizo", "Gala", "Fiesta", "Cumpleaños", "Aniversario"];

const daysOfWeek = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Mock data removed (services and staff are now loaded dynamically)

// Zod Schema ajustado
const eventSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  venue_id: z.string().min(1, "Debe seleccionar un salón"),
  type_event: z.string().min(1, "El tipo de evento es obligatorio").max(20),
  start_date: z.string().min(1, "La fecha de inicio es obligatoria"),
  end_date: z.string().min(1, "La fecha de fin es obligatoria"),
  status: z.enum(['Confirmed', 'Pending', 'On Hold', 'Cancelled', 'Lead', 'Finished']).default('Pending'),
  
  // UI Fields extra que se mantienen en el formulario aunque el backend no los use
  time: z.string().optional(),
  guests: z.string().optional()
});

export function EventsView() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [venues, setVenues] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal y Wizard
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false); // Prevents double-click save on step 4

  // States extras restaurados
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);

  // Vistas de Calendario
  const [viewMode, setViewMode] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Fecha restaurada para coincidir con la UI anterior si es necesario

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      client_id: "",
      venue_id: "",
      type_event: "",
      start_date: "",
      end_date: "",
      status: "Pending",
      time: "",
      guests: ""
    }
  });

  const watchVenueId = watch("venue_id");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, clientsRes, venuesRes, servicesRes, staffRes] = await Promise.all([
        eventService.getAll(),
        clientService.getAll(),
        venueService.getAll(),
        serviceExternalService.getAll(),
        employeeService.getAll()
      ]);

      if (!eventsRes.error) setEvents(extractList(eventsRes.data));
      if (!clientsRes.error) setClients(extractList(clientsRes.data));
      if (!venuesRes.error) setVenues(extractList(venuesRes.data));
      if (!servicesRes.error) setServicesList(extractList(servicesRes.data));
      if (!staffRes.error) {
        setStaffList(extractList(staffRes.data).filter(s => s.status === 'active'));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Restaurando la fecha actual al hoy real (puedes cambiarlo si necesitas ver 2026)
    setCurrentDate(new Date()); 

    // Escuchar notificaciones en tiempo real para actualizar la tabla
    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket conectado en events-view');
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión socket en events-view:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket desconectado en events-view:', reason);
    });

    socket.on('new_reservation', () => {
      // Recargar la lista de eventos cuando entra una nueva reserva
      loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Proteger contra doble clic accidental al llegar al último paso
  useEffect(() => {
    if (wizardStep === 4) {
      setCanSubmit(false);
      const timer = setTimeout(() => setCanSubmit(true), 600);
      return () => clearTimeout(timer);
    }
  }, [wizardStep]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch(e) {
      return "";
    }
  };

  const formatTimeForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch(e) {
      return "";
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    reset({
      client_id: "",
      venue_id: "",
      type_event: "",
      start_date: "",
      end_date: "",
      status: "Pending",
      time: "",
      guests: ""
    });
    setWizardStep(1);
    setSelectedServices([]);
    setSelectedStaff([]);
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    reset({
      client_id: String(event.client_id || event.Client?.client_id || ""),
      venue_id: String(event.venue_id || event.Venue?.venue_id || ""),
      type_event: event.type_event || "",
      start_date: formatDateForInput(event.start_date || event.date),
      end_date: formatDateForInput(event.end_date || event.date),
      status: event.status || "Pending",
      time: event.time || formatTimeForInput(event.start_date),
      guests: String(event.guests || "")
    });
    setWizardStep(1);
    
    // Parsear servicios asignados
    const eventServices = event.EventItems ? event.EventItems.map(item => item.service_id) : [];
    setSelectedServices(eventServices);

    // Parsear personal asignado
    const eventStaffList = event.EventStaffs ? event.EventStaffs.map(staff => staff.employee_id) : [];
    setSelectedStaff(eventStaffList);

    setModalOpen(true);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setModalOpen(false);
    setEditingEvent(null);
    setSelectedServices([]);
    setSelectedStaff([]);
    reset();
  };

  const toggleService = (id) => {
    setSelectedServices((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };
  const toggleStaff = (id) => {
    setSelectedStaff((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);
    
    // Usamos el formato local explícito para evitar saltos UTC
    const startDateStr = `${data.start_date} ${data.time || "00:00"}:00`;
    const endDateStr = `${data.end_date} ${data.time || "23:59"}:00`;

    const payload = {
      client_id: Number(data.client_id),
      venue_id: Number(data.venue_id),
      type_event: data.type_event,
      start_date: startDateStr,
      end_date: endDateStr,
      status: data.status,
      // Incluimos campos extra aunque el backend actual los ignore, para que la UI mantenga el scope
      guests: Number(data.guests) || 0,
      services: selectedServices,
      staff: selectedStaff
    };

    try {
      if (editingEvent) {
        const id = editingEvent.event_id || editingEvent.id;
        const res = await eventService.update(id, payload);
        if (res && res.error) throw new Error(res.error);
        toast.success("Evento actualizado exitosamente");
      } else {
        const res = await eventService.create(payload);
        if (res && res.error) throw new Error(res.error);
        toast.success("Evento creado exitosamente");
      }
      resetWizard();
      loadData();
    } catch (err) {
      toast.error(err.message || "Error procesando el evento");
    } finally {
      setIsProcessing(false);
    }
  };

  // Actions para aceptar/eliminar
  const handleAcceptEvent = async (event) => {
    try {
      const id = event.event_id || event.id;
      const res = await eventService.update(id, { ...event, status: 'Confirmed' });
      if (res && res.error) throw new Error(res.error);
      toast.success("Evento aceptado y confirmado");
      loadData();
    } catch (err) {
      toast.error(err.message || "Error al aceptar el evento");
    }
  };

  const handleDeleteEvent = async (event) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        const id = event.event_id || event.id;
        const res = await eventService.delete(id);
        if (res && res.error) throw new Error(res.error);
        toast.success("Evento eliminado exitosamente");
        loadData();
      } catch (err) {
        toast.error(err.message || "Error al eliminar el evento");
      }
    }
  };

  // Nombres Dinámicos
  const getEventName = (event) => {
    if (event.name) return event.name;
    const cName = event.Client?.name || "Cliente";
    return `${event.type_event || 'Evento'} de ${cName}`;
  };

  // Lógica Calendario Nativo
  
  const getLocalDateValues = (rawStr) => {
    if (!rawStr) return null;
    const d = new Date(rawStr);
    if (isNaN(d.getTime())) return null;
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      timeStr: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`
    };
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getEventsForDay = (day) => {
    return events.filter((e) => {
      const vals = getLocalDateValues(e.start_date || e.date);
      if (!vals) return false;
      return vals.year === currentDate.getFullYear() &&
             vals.month === currentDate.getMonth() &&
             vals.day === day;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const handleDragStart = (e, eventItem) => {
    e.dataTransfer.setData("eventId", eventItem.event_id || eventItem.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, day) => {
    e.preventDefault();
    if (!day) return;
    
    const eventId = e.dataTransfer.getData("eventId");
    if (!eventId) return;

    const originalEvent = events.find(ev => (ev.event_id || ev.id).toString() === eventId);
    if (!originalEvent) return;

    const vals = getLocalDateValues(originalEvent.start_date || originalEvent.date);
    if (!vals) {
      toast.error("Error: el evento tiene una fecha inválida");
      return;
    }

    // Nueva fecha combinando el día en que se soltó + la hora original en string para evitar shifts
    const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')} ${vals.timeStr}`;
    
    // Extraemos end_date calculando la duración si existe
    let end_date = originalEvent.end_date;
    if (end_date) {
      const endVals = getLocalDateValues(end_date);
      if (endVals) {
        // Calcular diferencia en ms usando Date.UTC para evitar DST bugs, pero getTime() es más simple
        const oldStart = new Date(originalEvent.start_date).getTime();
        const oldEnd = new Date(originalEvent.end_date).getTime();
        if (!isNaN(oldStart) && !isNaN(oldEnd)) {
          const diff = oldEnd - oldStart;
          // Aplicar la diferencia a la nueva fecha de inicio
          const newStartObj = new Date(newDateStr.replace(' ', 'T')); 
          const newEndObj = new Date(newStartObj.getTime() + diff);
          end_date = `${newEndObj.getFullYear()}-${String(newEndObj.getMonth()+1).padStart(2,'0')}-${String(newEndObj.getDate()).padStart(2,'0')} ${String(newEndObj.getHours()).padStart(2,'0')}:${String(newEndObj.getMinutes()).padStart(2,'0')}:00`;
        }
      }
    }

    try {
      const res = await eventService.update(eventId, {
        ...originalEvent,
        start_date: newDateStr,
        end_date: end_date || newDateStr
      });
      if (res && res.error) throw new Error(res.error);
      toast.success(`Evento reagendado al ${day} de ${monthNames[currentDate.getMonth()]}`);
      loadData();
    } catch (error) {
      toast.error("Error al reagendar el evento.");
    }
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    openCreateModal();
    const dateStr = `${clickDate.getFullYear()}-${String(clickDate.getMonth()+1).padStart(2,'0')}-${String(clickDate.getDate()).padStart(2,'0')}`;
    setTimeout(() => {
      setValue("start_date", dateStr);
      setValue("end_date", dateStr);
    }, 100);
  };

  const wizardSteps = [
    { id: 1, label: "Cliente y Fechas", icon: User },
    { id: 2, label: "Salón", icon: Building },
    { id: 3, label: "Servicios", icon: Briefcase },
    { id: 4, label: "Personal", icon: UserPlus }
  ];

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gestión de Eventos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra tus eventos, salones y servicios.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-2xl bg-card/40 p-1 backdrop-blur-md shadow-sm border border-border/50">
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Lista
            </button>
          </div>
          <Button
            onClick={openCreateModal}
            className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Evento
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d3557]"></div>
        </div>
      )}

      {/* Calendar View (Native) */}
      {!loading && viewMode === "calendar" && (
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">
                <span className="capitalize">{monthNames[currentDate.getMonth()]}</span> {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-lg border-border hover:bg-muted/50 font-semibold shadow-sm">
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={prevMonth} className="rounded-lg border-border hover:bg-muted/50 shadow-sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth} className="rounded-lg border-border hover:bg-muted/50 shadow-sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div
                    key={index}
                    onDragOver={day ? handleDragOver : null}
                    onDrop={day ? (e) => handleDrop(e, day) : null}
                    onClick={() => day ? handleDayClick(day) : null}
                    className={`min-h-32 rounded-xl border p-2 transition-all duration-200 
                      ${day ? "border-white/10 bg-card/40 hover:bg-card/80 hover:border-[#c05c3c]/50 cursor-pointer shadow-sm hover:shadow-md" : "border-transparent bg-transparent"} 
                      ${isToday ? "ring-2 ring-[#c05c3c] bg-[#c05c3c]/5" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-[#c05c3c] text-white" : "text-foreground/70"}`}>
                          {day}
                        </span>
                        <div className="mt-2 space-y-1.5 custom-scrollbar max-h-[100px] overflow-y-auto">
                          {dayEvents.map((event) => (
                            <div
                              key={event.event_id || event.id}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, event);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(event);
                              }}
                              className={`cursor-grab active:cursor-grabbing truncate rounded-lg px-2 py-1.5 text-xs font-bold shadow-sm border border-white/10 transition-transform hover:scale-[1.02] hover:shadow-md ${statusColors[event.status || 'Pending'] || "bg-[#1d3557] text-white"}`}
                              title={getEventName(event)}
                            >
                              {getEventName(event)}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 border-t border-border/50 pt-4">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                  <div className={`h-3 w-3 rounded-full ${color.split(' ')[0]}`} />
                  <span className="text-xs text-foreground font-bold uppercase tracking-wider">{statusLabels[status]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && (
        <div className="grid gap-4">
          {events.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 bg-card/40 backdrop-blur-sm border-white/10">
              <CalendarIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium text-lg">No hay eventos registrados</p>
              <Button onClick={openCreateModal} className="mt-4 bg-[#c05c3c] hover:bg-[#a84d32] text-white rounded-xl">Crear tu primer evento</Button>
            </Card>
          ) : (
            events.map((event) => {
              const eName = getEventName(event);
              const startDate = new Date(event.start_date || event.date);
              const timeDisplay = event.time || (startDate.getTime() ? startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : "00:00");
              
              return (
                <Card
                  key={event.event_id || event.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#c05c3c]/10 text-[#c05c3c] border border-[#c05c3c]/20 shadow-sm">
                          <span className="text-xs font-bold uppercase">{isNaN(startDate.getMonth()) ? "N/A" : monthNames[startDate.getMonth()].substring(0,3)}</span>
                          <span className="text-xl font-black leading-none">{isNaN(startDate.getDate()) ? "-" : startDate.getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-foreground">
                              {eName}
                            </h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${statusColors[event.status || 'Pending'] || "bg-[#1d3557] text-white"}`}>
                              {statusLabels[event.status || 'Pending']}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium">
                              <User className="h-4 w-4" />
                              {event.Client?.name ? `${event.Client.name} ${event.Client.last_name || ''}` : "Cliente Desconocido"}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="h-4 w-4" />
                              {event.Venue?.name || event.venue || "Sin salón"}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="h-4 w-4" />
                              {timeDisplay}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <Users className="h-4 w-4" />
                              {event.guests || 0} invitados
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end mt-4 lg:mt-0">
                        {(event.status === 'Pending' || event.status === 'Lead') && (
                          <Button
                            variant="outline"
                            onClick={() => handleAcceptEvent(event)}
                            className="rounded-xl border-green-500/50 text-green-500 hover:bg-green-500/10 transition-all"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Aceptar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => openEditModal(event)}
                          className="rounded-xl border-[#f472b6]/50 text-[#f472b6] hover:bg-[#f472b6]/10 transition-all"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteEvent(event)}
                          className="rounded-xl border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
      </div>

      {/* RESTAURADO: WIZARD COMPLETO DE 4 PASOS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/40 overflow-hidden">
            <CardHeader className="flex-none flex flex-row items-center justify-between border-b border-border/50 pb-4 bg-muted/20">
              <CardTitle className="text-xl font-bold text-foreground">
                {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
              </CardTitle>
              <button
                onClick={resetWizard}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {/* Wizard Steps Indicator - Restaurado a 4 pasos */}
              <div className="mb-8 flex items-center justify-between">
                {wizardSteps.map((step, index) => (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 shadow-sm ${wizardStep >= step.id ? "bg-[#c05c3c] text-white" : "bg-card border border-border text-muted-foreground"}`}>
                        {wizardStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                      </div>
                      <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${wizardStep >= step.id ? "text-[#c05c3c]" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < wizardSteps.length - 1 && (
                      <div className="mx-4 h-0.5 flex-1 relative bg-border/50 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full bg-[#c05c3c] transition-all duration-500 ease-in-out ${wizardStep > step.id ? "w-full" : "w-0"}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Client & Dates (Restaurado con Time y Guests) */}
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente Asignado</Label>
                        <select 
                          {...register("client_id")}
                          className={`w-full appearance-none rounded-xl border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c] transition-all ${errors.client_id ? 'border-red-500' : 'border-input'}`}
                        >
                          <option value="">Seleccionar cliente...</option>
                          {clients.map((client) => (
                            <option key={client.client_id || client.id} value={client.client_id || client.id}>
                              {client.name} {client.last_name} ({client.doc_id})
                            </option>
                          ))}
                        </select>
                        {errors.client_id && <p className="text-xs text-red-500">{errors.client_id.message}</p>}
                      </div>

                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de Evento</Label>
                        <select 
                          {...register("type_event")}
                          className={`w-full appearance-none rounded-xl border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c] transition-all ${errors.type_event ? 'border-red-500' : 'border-input'}`}
                        >
                          <option value="">Seleccionar tipo...</option>
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.type_event && <p className="text-xs text-red-500">{errors.type_event.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio</Label>
                        <Input
                          type="date"
                          {...register("start_date")}
                          className={`rounded-xl border bg-background/50 focus:ring-2 focus:ring-[#c05c3c] transition-all ${errors.start_date ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Fin</Label>
                        <Input
                          type="date"
                          {...register("end_date")}
                          className={`rounded-xl border bg-background/50 focus:ring-2 focus:ring-[#c05c3c] transition-all ${errors.end_date ? 'border-red-500' : 'border-input'}`}
                        />
                        {errors.end_date && <p className="text-xs text-red-500">{errors.end_date.message}</p>}
                      </div>
                    </div>
                    
                    {/* Campos de UI Restaurados: Hora e Invitados */}
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hora</Label>
                        <Input
                          type="time"
                          {...register("time")}
                          className={`rounded-xl border bg-background/50 focus:ring-2 focus:ring-[#c05c3c] transition-all`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Invitados</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          {...register("guests")}
                          className={`rounded-xl border bg-background/50 focus:ring-2 focus:ring-[#c05c3c] transition-all`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado del Evento</Label>
                      <select 
                        {...register("status")}
                        className={`w-full appearance-none rounded-xl border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c] transition-all`}
                      >
                        <option value="Lead">Lead (Prospecto)</option>
                        <option value="Pending">Pendiente</option>
                        <option value="Confirmed">Confirmado</option>
                        <option value="On Hold">En Espera</option>
                        <option value="Cancelled">Cancelado</option>
                        <option value="Finished">Finalizado</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Venue */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Label className="text-sm font-bold text-foreground">Seleccionar Salón (Venue)</Label>
                    {errors.venue_id && <p className="text-xs text-red-500 mb-2">{errors.venue_id.message}</p>}
                    
                    <div className="grid gap-4 sm:grid-cols-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                      {venues.map((venue) => {
                        const isSelected = watchVenueId === String(venue.venue_id || venue.id);
                        return (
                          <div
                            key={venue.venue_id || venue.id}
                            onClick={() => setValue("venue_id", String(venue.venue_id || venue.id), { shouldValidate: true })}
                            className={`cursor-pointer flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${isSelected ? 'border-[#c05c3c] bg-[#c05c3c]/5 shadow-md shadow-[#c05c3c]/10' : 'border-border/50 hover:border-[#c05c3c]/50 bg-card/50'}`}
                          >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${isSelected ? 'bg-[#c05c3c] text-white' : 'bg-muted text-muted-foreground'}`}>
                              <Building className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-foreground">{venue.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {venue.direction || venue.location || "Sin dirección"}
                              </p>
                              <p className="mt-2 text-xs font-semibold text-[#6b705c] bg-[#6b705c]/10 inline-block px-2 py-1 rounded-md">
                                Capacidad: {venue.capacity} per.
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c05c3c] shadow-sm">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Services RESTAURADO */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Label className="text-sm font-medium text-foreground">
                      Servicios Externos e Items
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {servicesList.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4">No hay servicios disponibles.</p>
                      ) : servicesList.map((service) => (
                        <div
                          key={service.service_id}
                          onClick={() => toggleService(service.service_id)}
                          className={`cursor-pointer flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${selectedServices.includes(service.service_id) ? "border-[#6b705c] bg-[#6b705c]/10" : "border-input hover:border-[#c05c3c]"}`}
                        >
                          <div>
                            <p className="font-medium text-foreground">{service.name || service.service_type}</p>
                            <p className="text-sm text-muted-foreground">{service.service_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#6b705c]">
                              ${service.base_price || 0}
                            </span>
                            {selectedServices.includes(service.service_id) && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b705c]">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Staff RESTAURADO */}
                {wizardStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Label className="text-sm font-medium text-foreground">
                      Asignar Personal
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {staffList.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4">No hay personal activo.</p>
                      ) : staffList.map((person) => (
                        <div
                          key={person.employee_id}
                          onClick={() => toggleStaff(person.employee_id)}
                          className={`cursor-pointer flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${selectedStaff.includes(person.employee_id) ? "border-[#6b705c] bg-[#6b705c]/10" : "border-input hover:border-[#c05c3c]"}`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3557]/10">
                            <span className="text-sm font-semibold text-[#1d3557]">
                              {person.first_name ? person.first_name[0] : 'E'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{person.first_name} {person.last_name}</p>
                            <p className="text-sm text-muted-foreground">{person.rol || "Personal"}</p>
                          </div>
                          {selectedStaff.includes(person.employee_id) && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b705c]">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-4 flex justify-between border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : resetWizard()}
                    className="rounded-xl border-border"
                  >
                    {wizardStep > 1 ? "Anterior" : "Cancelar"}
                  </Button>
                  
                  {wizardStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      Siguiente Paso
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isProcessing || !canSubmit}
                      className={`rounded-xl text-white shadow-lg transition-all ${isProcessing || !canSubmit ? "bg-muted-foreground cursor-not-allowed" : "bg-[#c05c3c] shadow-[#c05c3c]/30 hover:bg-[#a84d32] hover:-translate-y-0.5"}`}
                    >
                      {isProcessing ? "Procesando..." : (editingEvent ? "Guardar Cambios" : "Crear Evento")}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
