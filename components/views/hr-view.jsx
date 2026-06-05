"use client";
import { useState, useEffect } from "react";
import {
  UserCog,
  Mail,
  Phone,
  Calendar,
  Plus,
  Search,
  BadgeCheck,
  X,
  ChevronDown,
  MapPin,
  Clock,
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  Download,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/lib/services/employee.service";
import { reportService } from "@/lib/services/report.service";
import { extractList } from "@/lib/api-client";

const departments = ["Todos", "Administrador", "Bartender", "Mesero", "Gerente", "Seguridad", "Cajero"];

const statusColors = {
  active: "bg-[#6b705c] text-white",
  inactive: "bg-card/70 text-[#6b705c]",
  suspended: "bg-[#c05c3c]/10 text-[#c05c3c]"
};

const statusLabels = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido"
};

export function HRView() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("directory");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Todos");
  const [isExporting, setIsExporting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Perfil seleccionado
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Nuevo Empleado Data
  const [newEmployeeData, setNewEmployeeData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    rol: "",
    salary_per_event: "",
    status: "active"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      if (response.error) throw new Error(response.error);
      const data = extractList(response.data);
      setEmployees(data);
    } catch (err) {
      setError(err.message || "Error al cargar empleados");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async () => {
    try {
      const response = await employeeService.create(newEmployeeData);
      if (response.error) throw new Error(response.error);
      setModalOpen(false);
      setNewEmployeeData({ first_name: "", last_name: "", email: "", phone: "", rol: "", salary_per_event: "", status: "active" });
      loadData();
    } catch (err) {
      alert("Error al crear empleado: " + err.message);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      const response = await employeeService.update(selectedEmployee.employee_id, editFormData);
      if (response.error) throw new Error(response.error);
      setIsEditing(false);
      setSelectedEmployee({ ...selectedEmployee, ...editFormData });
      loadData();
    } catch (err) {
      alert("Error al actualizar empleado: " + err.message);
    }
  };

  const handleDeleteEmployee = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
      try {
        const response = await employeeService.delete(selectedEmployee.employee_id);
        if (response.error) throw new Error(response.error);
        setSelectedEmployee(null);
        loadData();
      } catch (err) {
        alert("Error al eliminar empleado: " + err.message);
      }
    }
  };

  const openProfile = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      rol: employee.rol || "",
      salary_per_event: employee.salary_per_event || "",
      status: employee.status || "active"
    });
    setIsEditing(false);
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadEmployeesPDF();
    } finally {
      setIsExporting(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (employee.rol || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "Todos" || (employee.rol || "") === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const upcomingAssignments = employees.flatMap(
    (employee) => (employee.assignments || []).map((assignment) => ({
      ...assignment,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      employeeRole: employee.rol,
      employeeId: employee.employee_id
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // VISTA DE PERFIL (Cuando se selecciona un empleado)
  if (selectedEmployee) {
    return (
      <div className="space-y-8">
        <Button
          variant="outline"
          onClick={() => setSelectedEmployee(null)}
          className="rounded-xl border-border hover:bg-muted/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al directorio
        </Button>

        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d3557]">
                  <span className="text-2xl font-semibold text-white">
                    {selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h1>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[selectedEmployee.status] || "bg-gray-200"}`}>
                      {statusLabels[selectedEmployee.status] || selectedEmployee.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rol: {selectedEmployee.rol || "No definido"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteEmployee}
                  className="rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => {
                    if (isEditing) {
                      handleUpdateEmployee();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className={isEditing ? "rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]" : "rounded-xl border-border hover:bg-muted/50"}
                >
                  {isEditing ? <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</> : <><Edit className="mr-2 h-4 w-4" /> Editar Perfil</>}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditFormData({
                      first_name: selectedEmployee.first_name,
                      last_name: selectedEmployee.last_name,
                      email: selectedEmployee.email,
                      phone: selectedEmployee.phone,
                      rol: selectedEmployee.rol,
                      salary_per_event: selectedEmployee.salary_per_event,
                      status: selectedEmployee.status
                    });
                  }} className="rounded-xl border-border hover:bg-muted/50">
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={editFormData.first_name} onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido</Label>
                      <Input value={editFormData.last_name} onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Correo electrónico</Label>
                      <Input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rol</Label>
                      <Input value={editFormData.rol} onChange={(e) => setEditFormData({...editFormData, rol: e.target.value})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <select 
                        value={editFormData.status} 
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tarifa por Evento ($)</Label>
                      <Input type="number" value={editFormData.salary_per_event} onChange={(e) => setEditFormData({...editFormData, salary_per_event: parseFloat(e.target.value) || 0})} className="rounded-xl focus:ring-[#c05c3c]"/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                      <Mail className="h-5 w-5 text-[#6b705c]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Correo electrónico</p>
                      <p className="font-medium text-foreground">{selectedEmployee.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                      <Phone className="h-5 w-5 text-[#6b705c]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium text-foreground">{selectedEmployee.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                      <Calendar className="h-5 w-5 text-[#6b705c]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha de registro</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedEmployee.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80">
                      <BadgeCheck className="h-5 w-5 text-[#6b705c]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tarifa por Evento</p>
                      <p className="font-medium text-foreground">${selectedEmployee.salary_per_event || "0"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL (Lista de Empleados)
  return (
    <>
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recursos Humanos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona empleados, roles y asignaciones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-[200px] rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
              />
            </div>
            <div className="relative">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="h-9 rounded-lg gap-2 border-border hover:bg-muted"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Generando..." : "Generar PDF"}
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="h-9 rounded-lg bg-[#c05c3c] px-4 text-sm text-white shadow-md hover:bg-[#a84d32]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </div>
        </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3557]">
                <UserCog className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {employees.length}
                </p>
                <p className="text-sm text-muted-foreground">Empleados totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6b705c]">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter((e) => e.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4a574]">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter((e) => e.status === "inactive" || e.status === "suspended").length}
                </p>
                <p className="text-sm text-muted-foreground">De baja / Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c05c3c]">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingAssignments.length}
                </p>
                <p className="text-sm text-muted-foreground">Próximas asignaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-card/40 p-2 backdrop-blur-md shadow-sm border border-border/50">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === "directory" ? "bg-card text-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <UserCog className="h-4 w-4" />
          Directorio
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === "assignments" ? "bg-card text-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Asignaciones
        </button>
      </div>

      {/* Directory View */}
      {activeTab === "directory" && (
        <>
          {/* Directory View Content */}          {/* Employees Table */}
          <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Directorio de empleados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando empleados...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No se encontraron empleados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-card/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Empleado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Contacto
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Fecha de ingreso
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Tarifa / Evento
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.employee_id}
                          className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm cursor-pointer"
                          onClick={() => openProfile(employee)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d3557]/20 to-[#1d3557]/5 border border-[#1d3557]/10">
                                <span className="text-sm font-semibold text-[#1d3557]">
                                  {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                               </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {employee.first_name} {employee.last_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-foreground">{employee.rol || "No asignado"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {employee.email || "N/A"}
                              </p>
                              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {employee.phone || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                              {new Date(employee.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[employee.status] || "bg-gray-200"}`}
                            >
                              {statusLabels[employee.status] || employee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-[#6b705c]">${employee.salary_per_event || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProfile(employee);
                              }}
                              className="rounded-lg border-border text-xs hover:bg-muted/50"
                            >
                              Ver perfil
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Assignments View */}
      {activeTab === "assignments" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-[#c05c3c]" />
                Próximas asignaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-4 rounded-xl bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3557]/10">
                          <span className="text-sm font-semibold text-[#1d3557]">
                            {assignment.employeeName.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {assignment.employeeName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.employeeRole}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#c05c3c]" />
                          <span className="text-sm font-medium text-foreground">
                            {assignment.event}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {assignment.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {assignment.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-card/80 p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium text-foreground">
                    No hay asignaciones próximas
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Las asignaciones aparecerán aquí una vez que se creen eventos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>

      {/* Add Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Nuevo empleado
              </CardTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Nombre
                  </Label>
                  <Input
                    placeholder="Nombre"
                    value={newEmployeeData.first_name}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, first_name: e.target.value})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Apellido
                  </Label>
                  <Input
                    placeholder="Apellido"
                    value={newEmployeeData.last_name}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, last_name: e.target.value})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newEmployeeData.email}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, email: e.target.value})}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Teléfono</Label>
                <Input
                  placeholder="+34 612 345 678"
                  value={newEmployeeData.phone}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, phone: e.target.value})}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Rol</Label>
                  <div className="relative">
                    <select 
                      value={newEmployeeData.rol}
                      onChange={(e) => setNewEmployeeData({...newEmployeeData, rol: e.target.value})}
                      className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="">Seleccionar...</option>
                      {departments.slice(1).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Tarifa por Evento ($)</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={newEmployeeData.salary_per_event}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, salary_per_event: parseFloat(e.target.value) || 0})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Estado</Label>
                  <div className="relative">
                    <select 
                      value={newEmployeeData.status}
                      onChange={(e) => setNewEmployeeData({...newEmployeeData, status: e.target.value})}
                      className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateEmployee}
                  className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
                >
                  Crear Empleado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
