"use client";
import { useState, useEffect } from "react";
import { apiClient, extractList } from "@/lib/api-client";
import {
  Users,
  Building,
  Briefcase,
  Plus,
  Search,
  X,
  ChevronDown,
  Shield,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Users will be loaded dynamically from the backend
const venues = [
  {
    id: 1,
    name: "Villa Rosemary",
    capacity: 200,
    location: "Valencia",
    status: "Disponible",
    pricePerHour: 500
  },
  {
    id: 2,
    name: "Coastal Resort",
    capacity: 350,
    location: "Alicante",
    status: "Ocupado",
    pricePerHour: 750
  },
  {
    id: 3,
    name: "Garden Terrace",
    capacity: 100,
    location: "Valencia",
    status: "Disponible",
    pricePerHour: 300
  },
  {
    id: 4,
    name: "Grand Hall",
    capacity: 500,
    location: "Madrid",
    status: "Mantenimiento",
    pricePerHour: 1e3
  },
  {
    id: 5,
    name: "Sunset Beach Club",
    capacity: 600,
    location: "Malaga",
    status: "Disponible",
    pricePerHour: 850
  }
];
const externalServices = [
  {
    id: 1,
    name: "Mediterraneo Catering",
    type: "Catering",
    contact: "+34 612 345 678",
    priceBase: 45,
    unit: "por persona"
  },
  {
    id: 2,
    name: "DJ Sound Pro",
    type: "DJ y Sonido",
    contact: "+34 623 456 789",
    priceBase: 800,
    unit: "por evento"
  },
  {
    id: 3,
    name: "Southern Blooms",
    type: "Floral",
    contact: "+34 634 567 890",
    priceBase: 350,
    unit: "por evento"
  },
  {
    id: 4,
    name: "Photo Studio Elite",
    type: "Fotograf\xEDa",
    contact: "+34 645 678 901",
    priceBase: 1200,
    unit: "por evento"
  },
  {
    id: 5,
    name: "Light Masters",
    type: "Iluminaci\xF3n",
    contact: "+34 656 789 012",
    priceBase: 500,
    unit: "por evento"
  }
];
const roles = ["Administradores", "Coordinadores", "Chefs", "Gerentes de bar", "Ventas", "Operaciones"];
const venueStatuses = ["Disponible", "Ocupado", "Mantenimiento"];
const statusColors = {
  Activo: "bg-[#6b705c] text-white",
  Inactivo: "bg-card/80 text-[#6b705c]",
  active: "bg-[#6b705c] text-white",
  inactive: "bg-card/80 text-[#6b705c]",
  suspended: "bg-[#c05c3c]/10 text-[#c05c3c]",
  Disponible: "bg-[#6b705c] text-white",
  Ocupado: "bg-[#c05c3c] text-white",
  Mantenimiento: "bg-[#d4a574] text-white"
};
export function AdminView() {
  const [activeTab, setActiveTab] = useState("users");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  // States for Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get('/users');
      if (!response.error) {
        setUsers(extractList(response.data));
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await apiClient.delete(`/users/${id}`);
        loadUsers();
      } catch (err) {
        alert("Error al eliminar el usuario");
      }
    }
  };
  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {
    /* Header */
  }
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Administración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona usuarios, salones y servicios externos.
        </p>
      </div>

      {
    /* Tabs */
  }
      <div className="flex flex-wrap gap-2 rounded-2xl bg-card/40 p-2 backdrop-blur-md shadow-sm border border-border/50">
        <button
    onClick={() => setActiveTab("users")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === "users" ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-foreground hover:bg-muted/50 hover:scale-105"}`}
  >
          <Users className="h-4 w-4" />
          Usuarios y Permisos
        </button>
        <button
    onClick={() => setActiveTab("venues")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === "venues" ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-foreground hover:bg-muted/50 hover:scale-105"}`}
  >
          <Building className="h-4 w-4" />
          Salones
        </button>
        <button
    onClick={() => setActiveTab("services")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === "services" ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-foreground hover:bg-muted/50 hover:scale-105"}`}
  >
          <Briefcase className="h-4 w-4" />
          Servicios Externos
        </button>
      </div>

      {
    /* Users Tab */
  }
      {activeTab === "users" && <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="h-9 rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
              />
            </div>
            <Button
              onClick={() => setUserModalOpen(true)}
              className="h-9 rounded-lg bg-[#c05c3c] text-white shadow-md hover:bg-[#a84d32] px-4 text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-card/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Último acceso
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => <tr
                        key={user.user_id}
                        className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d3557]/20 to-[#1d3557]/5 border border-[#1d3557]/10">
                              <span className="text-sm font-semibold text-[#1d3557]">
                                {user.name.split(" ").map((n) => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#6b705c]" />
                            <span className="text-sm text-foreground">{user.Role?.name || "Administrador"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">{new Date(user.create_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[user.status] || "bg-gray-200"}`}
  >
                            {user.status === "active" ? "Activo" : user.status === "inactive" ? "Inactivo" : user.status === "suspended" ? "Suspendido" : user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
    variant="outline"
    size="sm"
    className="rounded-lg border-border hover:bg-muted/50"
  >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
    variant="outline"
    size="sm"
    onClick={() => handleDeleteUser(user.user_id)}
    className="rounded-lg border-[#c05c3c] text-[#c05c3c] hover:bg-[#c05c3c]/10"
  >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>)
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>}

      {
    /* Venues Tab */
  }
      {activeTab === "venues" && <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Card className="flex-1 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
    placeholder="Buscar salones..."
    className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
              </CardContent>
            </Card>
            <Button
    onClick={() => setVenueModalOpen(true)}
    className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
  >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo salón
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => <Card
    key={venue.id}
    className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40"
  >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d3557]/20 to-[#1d3557]/5 border border-[#1d3557]/10">
                      <Building className="h-6 w-6 text-[#1d3557]" />
                    </div>
                    <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[venue.status]}`}
  >
                      {venue.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {venue.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{venue.location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#6b705c]">{venue.capacity}</p>
                      <p className="text-xs text-muted-foreground">Capacidad</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        ${venue.pricePerHour}
                      </p>
                      <p className="text-xs text-muted-foreground">por hora</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
    variant="outline"
    className="flex-1 rounded-xl border-border hover:bg-muted/50"
  >
                      Editar
                    </Button>
                    <div className="relative">
                      <select className="h-10 appearance-none rounded-xl border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]">
                        {venueStatuses.map((status) => <option key={status} value={status}>
                            {status}
                          </option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {
    /* External Services Tab */
  }
      {activeTab === "services" && <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Card className="flex-1 rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
    placeholder="Buscar servicios..."
    className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
              </CardContent>
            </Card>
            <Button
    onClick={() => setServiceModalOpen(true)}
    className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
  >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo servicio
            </Button>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-card/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Proveedor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Precio base
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {externalServices.map((service) => <tr
    key={service.id}
    className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm"
  >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6b705c]/20 to-[#6b705c]/5 border border-[#6b705c]/10">
                              <Briefcase className="h-5 w-5 text-[#6b705c]" />
                            </div>
                            <p className="font-medium text-foreground">{service.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-medium text-foreground">
                            {service.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">{service.contact}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#6b705c]">
                            ${service.priceBase}
                          </p>
                          <p className="text-xs text-muted-foreground">{service.unit}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
    variant="outline"
    size="sm"
    className="rounded-lg border-border hover:bg-muted/50"
  >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
    variant="outline"
    size="sm"
    className="rounded-lg border-[#c05c3c] text-[#c05c3c] hover:bg-[#c05c3c]/10"
  >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>}
      </div>

      {
    /* Create User Modal */
  }
      {userModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Nuevo Usuario
              </CardTitle>
              <button
    onClick={() => setUserModalOpen(false)}
    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Nombre</Label>
                <Input
    placeholder="Nombre completo"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Correo electrónico</Label>
                <Input
    type="email"
    placeholder="correo@ejemplo.com"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Contraseña</Label>
                <Input
    type="password"
    placeholder="********"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Rol</Label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]">
                    <option value="">Seleccionar rol...</option>
                    {roles.map((role) => <option key={role} value={role}>
                        {role}
                      </option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
    variant="outline"
    onClick={() => setUserModalOpen(false)}
    className="rounded-xl border-border"
  >
                  Cancelar
                </Button>
                <Button
    onClick={() => setUserModalOpen(false)}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  Crear Usuario
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}

      {
    /* Create Venue Modal */
  }
      {venueModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Nuevo Salón
              </CardTitle>
              <button
    onClick={() => setVenueModalOpen(false)}
    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Nombre</Label>
                <Input
    placeholder="Nombre del salón"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Ubicación</Label>
                <Input
    placeholder="Ciudad"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Capacidad</Label>
                  <Input
    type="number"
    placeholder="100"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Precio/hora</Label>
                  <Input
    type="number"
    placeholder="500"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
    variant="outline"
    onClick={() => setVenueModalOpen(false)}
    className="rounded-xl border-border"
  >
                  Cancelar
                </Button>
                <Button
    onClick={() => setVenueModalOpen(false)}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  Crear Salón
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}

      {
    /* Create Service Modal */
  }
      {serviceModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Nuevo Servicio
              </CardTitle>
              <button
    onClick={() => setServiceModalOpen(false)}
    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Proveedor
                </Label>
                <Input
    placeholder="Nombre de empresa"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Tipo de servicio</Label>
                <Input
    placeholder="Catering, DJ, Fotografía..."
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Contacto</Label>
                <Input
    placeholder="+34 612 345 678"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Precio base</Label>
                  <Input
    type="number"
    placeholder="100"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Unidad</Label>
                  <Input
    placeholder="por persona, por evento..."
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
    variant="outline"
    onClick={() => setServiceModalOpen(false)}
    className="rounded-xl border-border"
  >
                  Cancelar
                </Button>
                <Button
    onClick={() => setServiceModalOpen(false)}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  Crear Servicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </>
  );
}
