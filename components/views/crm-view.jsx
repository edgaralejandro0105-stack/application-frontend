"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Plus,
  Search,
  X,
  ChevronDown,
  ArrowLeft,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientService } from "@/lib/services/client.service";
import { eventService } from "@/lib/services/event.service";
import { extractList } from "@/lib/api-client";
import { toast } from "sonner"; // If you're using sonner, it looks great for notifications

const statusColors = {
  Active: "bg-[#6b705c] text-white",
  Inactive: "bg-card/70 text-[#6b705c]",
  Prospect: "bg-[#d4a574] text-white",
  VIP: "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-lg"
};

const statusLabels = {
  Active: "Activo",
  Inactive: "Inactivo",
  Prospect: "Prospecto",
  VIP: "Cliente VIP"
};

export function CRMView() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Historial de eventos
  const [clientEvents, setClientEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll();
      if (response.error) {
        throw new Error(response.error);
      }
      setClients(extractList(response.data));
    } catch (err) {
      setError(err.message || "Error al cargar clientes");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cargar eventos cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      const fetchClientEvents = async () => {
        setLoadingEvents(true);
        try {
          const res = await eventService.getAll();
          if (!res.error) {
            const allEvents = extractList(res.data);
            const idToMatch = selectedClient.client_id || selectedClient.id;
            const relatedEvents = allEvents.filter(ev => 
              ev.client_id === idToMatch || 
              ev.Client?.client_id === idToMatch ||
              ev.Client?.id === idToMatch
            );
            
            // Ordenar por fecha de más reciente a más antiguo
            relatedEvents.sort((a, b) => new Date(b.start_date || b.date) - new Date(a.start_date || a.date));
            setClientEvents(relatedEvents);
          }
        } catch (e) {
          console.error("Error cargando eventos:", e);
        } finally {
          setLoadingEvents(false);
        }
      };
      fetchClientEvents();
    }
  }, [selectedClient]);

  const handleDeleteClient = async () => {
    const idToDelete = selectedClient.client_id || selectedClient.id;
    if (!idToDelete) return;
    
    setIsDeleting(true);
    try {
      await clientService.delete(idToDelete);
      toast.success("Cliente eliminado exitosamente");
      setDeleteModalOpen(false);
      setSelectedClient(null);
      loadData(); // Recargar lista
    } catch (err) {
      toast.error("Error al eliminar el cliente");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const name = `${client.name || ''} ${client.last_name || ''}`.trim();
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.doc_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getClientDisplayName = (client) => {
    return `${client.name || ''} ${client.last_name || ''}`.trim();
  };

  if (selectedClient) {
    const isVip = clientEvents.length > 3 || selectedClient.status === "VIP"; // Logica de ejemplo VIP
    const displayName = getClientDisplayName(selectedClient);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => setSelectedClient(null)}
          className="rounded-xl border-border hover:bg-muted/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a clientes
        </Button>

        {/* Client Profile Header */}
        <Card className="rounded-2xl border-white/10 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden relative">
          {isVip && (
            <div className="absolute top-0 right-0 p-4 bg-gradient-to-bl from-amber-500 to-transparent w-32 h-32 opacity-20 pointer-events-none" />
          )}
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${isVip ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-500/30 shadow-lg' : 'bg-[#1d3557]'} shadow-md`}>
                  <span className="text-2xl font-semibold text-white">
                    {selectedClient.name?.charAt(0) || "C"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {displayName}
                    </h1>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[isVip ? 'VIP' : (selectedClient.status || 'Active')]}`}>
                      {statusLabels[isVip ? 'VIP' : (selectedClient.status || 'Active')] || selectedClient.status || 'Activo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selectedClient.direction || selectedClient.city || "Sin dirección"}</span>
                    <span>Documento: <strong className="text-foreground">{selectedClient.doc_id || selectedClient.document || "N/A"}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(true)}
                  className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Cliente
                </Button>
                <Button className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32] shadow-lg shadow-[#c05c3c]/20 hover:-translate-y-0.5 transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Evento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Details Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Contact Info */}
          <Card className="rounded-2xl border-white/10 bg-card/60 backdrop-blur-md shadow-lg lg:col-span-1">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6b705c]" />
                Información de contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/50 shadow-sm">
                  <Mail className="h-5 w-5 text-[#6b705c]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Correo electrónico</p>
                  <p className="font-medium text-foreground text-base">{selectedClient.email || "No registrado"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/50 shadow-sm">
                  <Phone className="h-5 w-5 text-[#6b705c]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Teléfono</p>
                  <p className="font-medium text-foreground text-base">{selectedClient.phone || "No registrado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event History */}
          <Card className="rounded-2xl border-white/10 bg-card/60 backdrop-blur-md shadow-lg lg:col-span-2 flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#c05c3c]" />
                Historial de Eventos
              </CardTitle>
              {isVip && (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-bold">
                  <Award className="h-4 w-4" />
                  Cliente Frecuente
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 custom-scrollbar overflow-y-auto max-h-[400px]">
              {loadingEvents ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c05c3c]"></div>
                </div>
              ) : clientEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/60 space-y-3">
                  <Calendar className="h-12 w-12 opacity-20" />
                  <p>Este cliente no tiene eventos registrados aún.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {clientEvents.map(ev => (
                    <div key={ev.event_id || ev.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#c05c3c]/10 text-[#c05c3c]">
                          <span className="text-xs font-bold uppercase">{new Date(ev.start_date || ev.date).toLocaleString('es', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{new Date(ev.start_date || ev.date).getDate()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{ev.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {ev.status || "Programado"}
                            {ev.Venue?.name && ` • ${ev.Venue.name}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg text-[#6b705c] hover:text-[#6b705c] hover:bg-[#6b705c]/10">
                        Ver Detalles
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200">
            <Card className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-card shadow-2xl shadow-red-500/10 overflow-hidden">
              <div className="bg-red-500/10 p-6 flex flex-col items-center text-center border-b border-red-500/10">
                <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">¿Eliminar Cliente?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Estás a punto de eliminar a <strong>{displayName}</strong>. Esta acción no se puede deshacer y podría afectar el historial de ventas y eventos vinculados.
                </p>
              </div>
              <div className="p-4 flex gap-3 bg-background">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                  onClick={handleDeleteClient}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header & Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestión de Clientes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra tus relaciones con clientes y analiza su historial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-[200px] rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
              >
                <option value="All">Todos</option>
                <option value="Active">Activos</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactivos</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="h-9 rounded-lg bg-[#c05c3c] px-4 text-sm text-white shadow-md hover:bg-[#a84d32] transition-all hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          </div>
        </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6b705c]">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c05c3c]">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.filter((c) => c.status === "Active" || !c.status).length}
                </p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Clientes Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-400/5 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 shadow-lg shadow-orange-500/20">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.filter((c) => c.status === "VIP").length || 0}
                </p>
                <p className="text-sm text-amber-600/80 dark:text-amber-500/80 font-bold uppercase tracking-wider">Clientes VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d3557]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-500 font-bold text-lg mb-1">Error al cargar clientes</p>
                <p className="text-sm text-red-500/80">{error}</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground/60">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No se encontraron clientes</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="border-b border-border bg-card/80 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredClients.map((client) => {
                    const displayName = getClientDisplayName(client);
                    const isVip = client.status === "VIP";
                    
                    return (
                    <tr
                      key={client.client_id || client.id}
                      className="cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] group"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isVip ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/20' : 'bg-[#1d3557]/10'} border border-white/5 transition-transform group-hover:scale-105`}>
                            <span className={`text-lg font-bold ${isVip ? 'text-white' : 'text-[#1d3557]'}`}>
                              {client.name?.charAt(0) || "C"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-base">{displayName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{client.city || "Sin ciudad registrada"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                          {client.doc_id || client.document || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {client.email && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <Mail className="h-3.5 w-3.5" /> {client.email}
                            </p>
                          )}
                          {client.phone && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <Phone className="h-3.5 w-3.5" /> {client.phone}
                            </p>
                          )}
                          {!client.email && !client.phone && <span className="text-sm text-muted-foreground/50">Sin contacto</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[client.status || 'Active']}`}>
                          {statusLabels[client.status || 'Active'] || client.status || "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-[#6b705c] hover:text-[#4a4e40] hover:bg-[#6b705c]/10 font-semibold transition-all group-hover:bg-[#6b705c]/15"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                        >
                          Ver perfil
                        </Button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Create Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-card shadow-2xl shadow-black/40 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 bg-muted/20">
              <CardTitle className="text-xl font-bold text-foreground">
                Nuevo Cliente
              </CardTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombres</Label>
                  <Input placeholder="Ej. Juan" className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Apellidos</Label>
                  <Input placeholder="Ej. Pérez" className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Documento de Identidad</Label>
                <Input placeholder="V-12345678" className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correo</Label>
                  <Input type="email" placeholder="correo@ej.com" className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teléfono</Label>
                  <Input placeholder="0414..." className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dirección</Label>
                <Input placeholder="Ej. Calle Principal..." className="rounded-xl border-input bg-background/50 focus:ring-2 focus:ring-[#c05c3c]" />
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-border/50 mt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={() => setModalOpen(false)} className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all hover:-translate-y-0.5">
                  Registrar Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
