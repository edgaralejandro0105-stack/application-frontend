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
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientService } from "@/lib/services/client.service";
import { extractList } from "@/lib/api-client";
const statusColors = {
  Active: "bg-[#6b705c] text-white",
  Inactive: "bg-card/70 text-[#6b705c]",
  Prospect: "bg-[#d4a574] text-white"
};

const statusLabels = {
  Active: "Activo",
  Inactive: "Inactivo",
  Prospect: "Prospecto"
};
export function CRMView() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
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
    loadData();
  }, []);
  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  if (selectedClient) {
    return <div className="space-y-8">
        {
      /* Back Button */
    }
        <Button
      variant="outline"
      onClick={() => setSelectedClient(null)}
      className="rounded-xl border-white/10 hover:bg-white/10"
    >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a clientes
        </Button>

        {
      /* Client Profile Header */
    }
        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d3557]">
                  <span className="text-2xl font-semibold text-white">
                    {selectedClient.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {selectedClient.name}
                    </h1>
                    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedClient.status]}`}
    >
                      {statusLabels[selectedClient.status] || selectedClient.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Documento: {selectedClient.document}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
      variant="outline"
      className="rounded-xl border-white/10 hover:bg-white/10"
    >
                  Editar Client
                </Button>
                <Button className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Evento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {
      /* Contact Info & Stats */
    }
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-none shadow-md lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Información de contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                  <Mail className="h-5 w-5 text-[#6b705c]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Correo electrónico</p>
                  <p className="font-medium text-foreground">{selectedClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                  <Phone className="h-5 w-5 text-[#6b705c]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-foreground">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                  <MapPin className="h-5 w-5 text-[#6b705c]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ciudad</p>
                  <p className="font-medium text-foreground">{selectedClient.city || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Clientes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra tus relaciones con clientes e historial.
          </p>
        </div>
        <Button
    onClick={() => setModalOpen(true)}
    className="rounded-xl bg-[#c05c3c] text-white shadow-md hover:bg-[#a84d32]"
  >
          <Plus className="mr-2 h-4 w-4" />
          Agregar cliente
        </Button>
      </div>

      {
    /* Search & Filters */
  }
      <Card className="rounded-2xl border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
    placeholder="Buscar por nombre, correo o documento..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
  />
            </div>
            <div className="relative w-full sm:w-48">
              <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
  >
                <option value="All">Todos los estados</option>
                <option value="Active">Activo</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactivo</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {
    /* Stats */
  }
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6b705c]">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Clientes totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c05c3c]">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.filter((c) => c.status === "VIP" || c.status === "Active").length}
                </p>
                <p className="text-sm text-muted-foreground">Clientes activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {
    /* Clients Table */
  }
      <Card className="overflow-hidden rounded-2xl border-none shadow-md">
        <CardContent className="p-0">
          {loading ? <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground">Cargando clientes...</p>
            </div> : error ? <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error al cargar clientes</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div> : filteredClients.length === 0 ? <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground">No hay clientes disponibles</p>
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-card/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Contacto
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
                  {filteredClients.map((client) => <tr
    key={client.id}
    className="cursor-pointer transition-colors hover:bg-white/10"
    onClick={() => setSelectedClient(client)}
  >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3557]/10">
                            <span className="text-sm font-semibold text-[#1d3557]">
                              {client.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.city || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {client.email || "N/A"}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.phone || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[client.status] || "bg-gray-200"}`}
  >
                          {statusLabels[client.status] || client.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
    variant="outline"
    size="sm"
    className="rounded-lg border-white/10 text-xs hover:bg-white/10"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedClient(client);
    }}
  >
                          Ver detalles
                        </Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>

      {
    /* Create Client Modal */
  }
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-none shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Nuevo Cliente
              </CardTitle>
              <button
    onClick={() => setModalOpen(false)}
    className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
  >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Nombre completo / Razón social
                </Label>
                <Input
    placeholder="Nombre del cliente o empresa"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Documento (DNI/NIF)
                </Label>
                <Input
    placeholder="12345678A"
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
                <Label className="text-sm font-medium text-foreground">Teléfono</Label>
                <Input
    placeholder="+34 612 345 678"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Ubicación</Label>
                <Input
    placeholder="Ciudad, País"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
    variant="outline"
    onClick={() => setModalOpen(false)}
    className="rounded-xl border-white/10"
  >
                  Cancelar
                </Button>
                <Button
    onClick={() => setModalOpen(false)}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  Crear Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}
