"use client";
import { useState } from "react";
import {
  Calendar,
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
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const events = [
  {
    id: 1,
    name: "Boda Garc\xEDa",
    client: "Tueia Garcia",
    venue: "Villa Rosemary",
    date: "2026-01-15",
    time: "18:00",
    guests: 150,
    status: "Confirmed",
    type: "Wedding"
  },
  {
    id: 2,
    name: "Reuni\xF3n Anual Tech Corp",
    client: "Tech Corp Inc.",
    venue: "Coastal Resort",
    date: "2026-01-18",
    time: "09:00",
    guests: 200,
    status: "Lead",
    type: "Corporate"
  },
  {
    id: 3,
    name: "Bautizo Mart\xEDnez",
    client: "Carlos Tuetinez",
    venue: "Garden Terrace",
    date: "2026-02-20",
    time: "12:00",
    guests: 80,
    status: "Confirmed",
    type: "Baptism"
  },
  {
    id: 4,
    name: "Gala Navide\xF1a",
    client: "City Foundation",
    venue: "Grand Hall",
    date: "2026-02-22",
    time: "20:00",
    guests: 300,
    status: "Finished",
    type: "Gala"
  },
  {
    id: 5,
    name: "Fiesta de A\xF1o Nuevo",
    client: "Sunset Club",
    venue: "Sunset Beach Club",
    date: "2026-03-31",
    time: "22:00",
    guests: 500,
    status: "Lead",
    type: "Party"
  },
  {
    id: 6,
    name: "Cumplea\xF1os Ana",
    client: "Ana Rodriguez",
    venue: "Garden Terrace",
    date: "2026-02-28",
    time: "16:00",
    guests: 50,
    status: "Confirmed",
    type: "Birthday"
  }
];
const statusColors = {
  Lead: "bg-[#d4a574] text-white",
  Confirmed: "bg-[#6b705c] text-white",
  Finished: "bg-[#1d3557] text-white",
  Cancelled: "bg-[#c05c3c] text-white"
};
const statusLabels = {
  Lead: "Lead",
  Confirmed: "Confirmado",
  Finished: "Finalizado",
  Cancelled: "Cancelado"
};
const clients = [
  { id: 1, name: "Tueia Garcia", document: "12345678A", email: "maria@email.com" },
  { id: 2, name: "Tech Corp Inc.", document: "B12345678", email: "events@techcorp.com" },
  { id: 3, name: "Carlos Tuetinez", document: "23456789B", email: "carlos@email.com" },
  { id: 4, name: "City Foundation", document: "G12345678", email: "contact@cityfoundation.org" },
  { id: 5, name: "Sunset Club", document: "B23456789", email: "events@sunsetclub.es" }
];
const venues = [
  { id: 1, name: "Villa Rosemary", capacity: 200, location: "Valencia" },
  { id: 2, name: "Coastal Resort", capacity: 350, location: "Alicante" },
  { id: 3, name: "Garden Terrace", capacity: 100, location: "Valencia" },
  { id: 4, name: "Grand Hall", capacity: 500, location: "Madrid" },
  { id: 5, name: "Sunset Beach Club", capacity: 600, location: "Malaga" }
];
const eventTypes = ["Boda", "Corporativo", "Bautizo", "Gala", "Fiesta", "Cumplea\xF1os", "Aniversario"];
const services = [
  { id: 1, name: "Servicio de Catering", price: 45, unit: "por persona" },
  { id: 2, name: "DJ y Sistema de Sonido", price: 800, unit: "por evento" },
  { id: 3, name: "Arreglos Florales", price: 350, unit: "por evento" },
  { id: 4, name: "Fotograf\xEDa", price: 1200, unit: "por evento" },
  { id: 5, name: "Iluminaci\xF3n", price: 500, unit: "por evento" },
  { id: 6, name: "Servicio de Bar", price: 25, unit: "por persona" }
];
const staff = [
  { id: 1, name: "Ana Lopez", role: "Coordinadora" },
  { id: 2, name: "Miguel Santos", role: "Chef Principal" },
  { id: 3, name: "Laura Fernandez", role: "Bar Manager" },
  { id: 4, name: "David Ruiz", role: "Decorador" },
  { id: 5, name: "Carmen Vega", role: "Ventas" }
];
const daysOfWeek = ["Lun", "Mar", "Mier", "Jue", "Vie", "Sab", "Dom"];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
export function EventsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setFriwMode] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const toggleService = (id) => {
    setSelectedServices(
      (prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const toggleStaff = (id) => {
    setSelectedStaff(
      (prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const resetWizard = () => {
    setWizardStep(1);
    setSelectedServices([]);
    setSelectedStaff([]);
    setModalOpen(false);
  };
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };
  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });
  const wizardSteps = [
    { id: 1, label: "Cliente y Fechas", icon: User },
    { id: 2, label: "Sal\xF3n", icon: Building },
    { id: 3, label: "Servicios", icon: Briefcase },
    { id: 4, label: "Personal", icon: UserPlus }
  ];
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Eventos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra tus eventos, salones y servicios.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-2xl bg-card/70 p-1">
            <button
    onClick={() => setFriwMode("calendar")}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
              Calendario
            </button>
            <button
    onClick={() => setFriwMode("list")}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
              Lista
            </button>
          </div>
          <Button
    onClick={() => setModalOpen(true)}
    className="rounded-xl bg-[#c05c3c] text-white shadow-md hover:bg-[#a84d32]"
  >
            <Plus className="mr-2 h-4 w-4" />
            Crear Evento
          </Button>
        </div>
      </div>

      {
    /* Calendar Friw */
  }
      {viewMode === "calendar" && <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
    variant="outline"
    size="sm"
    onClick={prevMonth}
    className="rounded-lg border-border hover:bg-muted/50"
  >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
    variant="outline"
    size="sm"
    onClick={nextMonth}
    className="rounded-lg border-border hover:bg-muted/50"
  >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {
    /* Days of week header */
  }
            <div className="mb-2 grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => <div
    key={day}
    className="py-2 text-center text-sm font-medium text-muted-foreground"
  >
                  {day}
                </div>)}
            </div>
            {
    /* Calendar grid */
  }
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
    const dayEvents = day ? getEventsForDay(day) : [];
    const isToday = day === 15;
    return <div
      key={index}
      className={`min-h-24 rounded-xl border p-2 transition-all ${day ? "border-border bg-card/70 hover:border-[#f472b6]/50" : "border-transparent bg-card/30"} ${isToday ? "ring-2 ring-[#f472b6]" : ""}`}
    >
                    {day && <>
                        <span
      className={`text-sm font-medium ${isToday ? "text-[#c05c3c]" : "text-foreground"}`}
    >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => <div
      key={event.id}
      className={`truncate rounded px-1.5 py-0.5 text-xs font-medium ${statusColors[event.status]}`}
    >
                              {event.name}
                            </div>)}
                          {dayEvents.length > 2 && <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} más
                            </div>}
                        </div>
                      </>}
                  </div>;
  })}
            </div>
            {
    /* Legend */
  }
            <div className="mt-4 flex flex-wrap gap-4">
              {Object.entries(statusColors).map(([status, color]) => <div key={status} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded ${color}`} />
                  <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
                </div>)}
            </div>
          </CardContent>
        </Card>}

      {
    /* List Friw */
  }
      {viewMode === "list" && <div className="grid gap-4">
          {events.map((event) => <Card
    key={event.id}
    className="overflow-hidden rounded-2xl border-none shadow-md transition-all hover:shadow-lg"
  >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1d3557]/10">
                      <Calendar className="h-7 w-7 text-[#1d3557]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {event.name}
                        </h3>
                        <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[event.status]}`}
  >
                          {statusLabels[event.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Client: {event.client}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.date} a las {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.guests} invitados
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
    variant="outline"
    className="rounded-xl border-border hover:bg-muted/50"
  >
                      Ver Detalles
                    </Button>
                    <Button
    variant="outline"
    className="rounded-xl border-[#f472b6] text-[#f472b6] hover:bg-[#f472b6]/10"
  >
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}

      {
    /* Create Event Wizard Modal */
  }
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl rounded-2xl border-none shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Crear Nuevo Evento
              </CardTitle>
              <button
    onClick={resetWizard}
    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              {
    /* Wizard Steps Indicator */
  }
              <div className="mb-8 flex items-center justify-between">
                {wizardSteps.map((step, index) => <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${wizardStep >= step.id ? "bg-accent text-accent-foreground" : "bg-card/80 text-muted-foreground"}`}
  >
                        {wizardStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                      </div>
                      <span className="mt-2 text-xs font-medium text-muted-foreground">
                        {step.label}
                      </span>
                    </div>
                    {index < wizardSteps.length - 1 && <div
    className={`mx-4 h-0.5 flex-1 ${wizardStep > step.id ? "bg-accent" : "bg-muted/50"}`}
  />}
                  </div>)}
              </div>

              {
    /* Step 1: Client & Dates */
  }
              {wizardStep === 1 && <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Cliente</Label>
                    <div className="relative">
                      <select className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]">
                        <option value="">Seleccionar cliente...</option>
                        {clients.map((client) => <option key={client.id} value={client.id}>
                            {client.name} - {client.document}
                          </option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Tipo de Evento</Label>
                    <div className="relative">
                      <select className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]">
                        <option value="">Seleccionar tipo...</option>
                        {eventTypes.map((type) => <option key={type} value={type}>
                            {type}
                          </option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Fecha Inicio</Label>
                      <Input
    type="date"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Fecha Fin</Label>
                      <Input
    type="date"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Hora</Label>
                      <Input
    type="time"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Invitados</Label>
                      <Input
    type="number"
    placeholder="100"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                    </div>
                  </div>
                </div>}

              {
    /* Step 2: Venue */
  }
              {wizardStep === 2 && <div className="space-y-6">
                  <Label className="text-sm font-medium text-foreground">
                    Seleccionar Salón
                  </Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {venues.map((venue) => <button
    key={venue.id}
    className="flex items-start gap-4 rounded-xl border-2 border-input p-4 text-left transition-all hover:border-[#c05c3c] focus:border-[#c05c3c] focus:outline-none focus:ring-2 focus:ring-[#c05c3c]/20"
  >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3557]/10">
                          <Building className="h-6 w-6 text-[#1d3557]" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">{venue.location}</p>
                          <p className="mt-1 text-sm text-[#6b705c]">
                            Capacidad: {venue.capacity} personas
                          </p>
                        </div>
                      </button>)}
                  </div>
                </div>}

              {
    /* Step 3: Services */
  }
              {wizardStep === 3 && <div className="space-y-6">
                  <Label className="text-sm font-medium text-foreground">
                    Servicios Externos e Items
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => <button
    key={service.id}
    onClick={() => toggleService(service.id)}
    className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${selectedServices.includes(service.id) ? "border-[#6b705c] bg-[#6b705c]/10" : "border-input hover:border-[#c05c3c]"}`}
  >
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#6b705c]">
                            ${service.price}
                          </span>
                          {selectedServices.includes(service.id) && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b705c]">
                              <Check className="h-4 w-4 text-white" />
                            </div>}
                        </div>
                      </button>)}
                  </div>
                </div>}

              {
    /* Step 4: Staff */
  }
              {wizardStep === 4 && <div className="space-y-6">
                  <Label className="text-sm font-medium text-foreground">
                    Asignar Personal
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {staff.map((person) => <button
    key={person.id}
    onClick={() => toggleStaff(person.id)}
    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${selectedStaff.includes(person.id) ? "border-[#6b705c] bg-[#6b705c]/10" : "border-input hover:border-[#c05c3c]"}`}
  >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3557]/10">
                          <span className="text-sm font-semibold text-[#1d3557]">
                            {person.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{person.name}</p>
                          <p className="text-sm text-muted-foreground">{person.role}</p>
                        </div>
                        {selectedStaff.includes(person.id) && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b705c]">
                            <Check className="h-4 w-4 text-white" />
                          </div>}
                      </button>)}
                  </div>
                </div>}

              {
    /* Actions */
  }
              <div className="mt-8 flex justify-between">
                <Button
    variant="outline"
    onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : resetWizard()}
    className="rounded-xl border-border"
  >
                  {wizardStep > 1 ? "Anterior" : "Cancelar"}
                </Button>
                <Button
    onClick={() => wizardStep < 4 ? setWizardStep(wizardStep + 1) : resetWizard()}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  {wizardStep < 4 ? "Siguiente" : "Crear Evento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}
