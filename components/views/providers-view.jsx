"use client";
import { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, Trash2, MapPin, Phone, Mail, 
  User, CheckCircle2, XCircle, Truck, Download, Loader2 
} from "lucide-react";
import { reportService } from "@/lib/services/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerService } from "@/lib/services/provider.service";
import { extractList } from "@/lib/api-client";
import { toast } from "sonner";

export function ProvidersView() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    status: "active"
  });

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await providerService.getAll();
      if (!res.error) {
        setProviders(extractList(res.data));
      }
    } catch (err) {
      console.error("Failed to load providers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadProvidersPDF();
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedProvider(null);
    setFormData({ name: "", contact_name: "", phone: "", email: "", address: "", status: "active" });
    setIsModalOpen(true);
  };

  const openEditModal = (provider) => {
    setIsEditing(true);
    setSelectedProvider(provider);
    setFormData({
      name: provider.name || "",
      contact_name: provider.contact_name || "",
      phone: provider.phone || "",
      email: provider.email || "",
      address: provider.address || "",
      status: provider.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("El nombre del proveedor es obligatorio.");
      return;
    }

    try {
      let res;
      if (isEditing && selectedProvider) {
        res = await providerService.update(selectedProvider.provider_id, formData);
      } else {
        res = await providerService.create(formData);
      }
      
      if (res.error) {
        toast.error(`Error: ${res.error}`);
      } else {
        toast.success(isEditing ? "Proveedor actualizado" : "Proveedor creado");
        setIsModalOpen(false);
        loadProviders();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este proveedor?")) return;
    try {
      const res = await providerService.delete(id);
      if (res.error) {
        toast.error(`Error: ${res.error}`);
      } else {
        toast.success("Proveedor desactivado");
        loadProviders();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
      
      {/* Header Panel */}
      <Card className="glass-panel rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                Proveedores
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestiona tus proveedores, contactos y datos de facturación.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 w-full sm:w-[200px] rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <Button onClick={handleExportPDF} disabled={isExporting} variant="outline" className="h-9 rounded-lg gap-2 border-border hover:bg-muted">
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "Generando..." : "Generar PDF"}
              </Button>
              <Button onClick={openAddModal} className="h-9 rounded-lg bg-[#c05c3c] px-4 text-sm text-white shadow-md hover:bg-[#a84d32] transition-all hover:-translate-y-0.5 gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card className="glass-panel border-dashed p-10 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground font-medium text-lg">No se encontraron proveedores.</p>
          <Button className="mt-4 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all hover:-translate-y-0.5" onClick={openAddModal}>Registrar el primero</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <Card key={provider.provider_id} className="glass-panel rounded-2xl group relative">
              <CardContent className="p-6">
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {provider.status === "active" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                      <XCircle className="h-3 w-3" /> Inactivo
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 pr-20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg line-clamp-1">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {provider.contact_name || "Sin contacto"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2 bg-background/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone || "No especificado"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{provider.email || "No especificado"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{provider.address || "No especificada"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 rounded-xl bg-background/50 hover:bg-background border-white/10"
                      onClick={() => openEditModal(provider)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    {provider.status === "active" && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={() => handleDelete(provider.provider_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal - Rendered globally over the viewport */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-muted/30 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-semibold">Razón Social o Nombre *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 rounded-xl bg-background/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Contacto (Opcional)</Label>
                  <Input
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    className="mt-1 rounded-xl bg-background/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Teléfono</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 rounded-xl bg-background/50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Correo Electrónico</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 rounded-xl bg-background/50"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Dirección</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 rounded-xl bg-background/50"
                />
              </div>

              {isEditing && (
                <div>
                  <Label className="text-sm font-semibold">Estado</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full mt-1 rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-white/10 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all hover:-translate-y-0.5">
                  {isEditing ? "Guardar Cambios" : "Crear Proveedor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
