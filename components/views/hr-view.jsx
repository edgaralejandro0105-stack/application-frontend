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
  Edit,
  Trash2,
  Download,
  Loader2,
  SlidersHorizontal,
  AlertTriangle,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/lib/services/employee.service";
import { reportService } from "@/lib/services/report.service";
import { apiClient, extractList } from "@/lib/api-client";

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
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterAssignment, setFilterAssignment] = useState("Todos");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("dateDesc");
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [allEmployeesForAssignments, setAllEmployeesForAssignments] = useState([]);
  const [rolesList, setRolesList] = useState([]);

  // Edición / Eliminación directa
  const [editingEmployee, setEditingEmployee] = useState(null);
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

  const loadRoles = async () => {
    try {
      const response = await apiClient.get('/roles');
      if (!response.error) {
        const roles = extractList(response.data);
        setRolesList(roles.map((r) => r.role_name).filter(Boolean));
      }
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || void 0,
        rol: filterDepartment === "Todos" ? void 0 : filterDepartment,
        status: filterStatus === "Todos" ? void 0 : filterStatus,
      });
      if (response.error) throw new Error(response.error);
      const data = extractList(response.data);
      setEmployees(data);
      if (response.data && response.data.totalPages !== undefined) {
         setTotalPages(response.data.totalPages);
         setTotalItems(response.data.total);
      }
      
      // Cargar todas las asignaciones sin paginación para el panel
      const allResponse = await employeeService.getAll({ limit: 10000 });
      if (!allResponse.error) {
        setAllEmployeesForAssignments(extractList(allResponse.data));
      }
    } catch (err) {
      setError(err.message || "Error al cargar empleados");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, filterDepartment, filterStatus, currentPage]);

  const handleCreateEmployee = async () => {
    try {
      const payload = {
        ...newEmployeeData,
        salary_per_event: newEmployeeData.salary_per_event === "" ? 0 : Number(newEmployeeData.salary_per_event)
      };
      const response = await employeeService.create(payload);
      if (response.error) throw new Error(response.error);
      setModalOpen(false);
      setNewEmployeeData({ first_name: "", last_name: "", email: "", phone: "", rol: "", salary_per_event: "", status: "active" });
      loadData();
    } catch (err) {
      alert("Error al crear empleado: " + err.message);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      rol: employee.rol || "",
      salary_per_event: employee.salary_per_event || "",
      status: employee.status || "active"
    });
    setEditModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    try {
      const payload = {
        ...editFormData,
        salary_per_event: editFormData.salary_per_event === "" ? 0 : Number(editFormData.salary_per_event)
      };
      const response = await employeeService.update(editingEmployee.employee_id, payload);
      if (response.error) throw new Error(response.error);
      setEditModalOpen(false);
      setEditingEmployee(null);
      loadData();
    } catch (err) {
      alert("Error al actualizar empleado: " + err.message);
    }
  };

  const handleDeleteClick = (employeeId) => {
    setDeleteTargetId(employeeId);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteEmployee = async () => {
    try {
      const response = await employeeService.delete(deleteTargetId);
      if (response.error) throw new Error(response.error);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      alert("Error al eliminar empleado: " + err.message);
    }
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
    let matchesAssignment = true;
    if (filterAssignment === "Con Asignaciones") {
      matchesAssignment = employee.assignments && employee.assignments.length > 0;
    } else if (filterAssignment === "Sin Asignaciones") {
      matchesAssignment = !employee.assignments || employee.assignments.length === 0;
    }

    let matchesSalary = true;
    const salary = Number(employee.salary_per_event) || 0;
    if (salaryRange.min) matchesSalary = matchesSalary && salary >= Number(salaryRange.min);
    if (salaryRange.max) matchesSalary = matchesSalary && salary <= Number(salaryRange.max);

    return matchesAssignment && matchesSalary;
  }).sort((a, b) => {
    if (sortBy === "dateDesc") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "dateAsc") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "nameAsc") return (`${a.first_name} ${a.last_name}`).localeCompare(`${b.first_name} ${b.last_name}`);
    if (sortBy === "nameDesc") return (`${b.first_name} ${b.last_name}`).localeCompare(`${a.first_name} ${a.last_name}`);
    return 0;
  });

  const upcomingAssignments = allEmployeesForAssignments.flatMap(
    (employee) => (employee.assignments || []).map((assignment) => ({
      ...assignment,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      employeeRole: employee.rol,
      employeeId: employee.employee_id
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
          {/* Directory View Content */}          <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-card/40 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Directorio de empleados
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 flex-1 md:justify-end">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar (nombre, correo, tel)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9 w-full rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-9 rounded-lg border-border transition-all ${showFilters ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'hover:bg-muted/50'}`}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 rounded-xl border border-border/50 bg-background/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Departamento</Label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      {["Todos", ...rolesList].map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</Label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="Todos">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                      <option value="suspended">Suspendidos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asignaciones</Label>
                    <select
                      value={filterAssignment}
                      onChange={(e) => setFilterAssignment(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Con Asignaciones">Con Asignaciones</option>
                      <option value="Sin Asignaciones">Libres</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tarifa ($)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" placeholder="Min" 
                        value={salaryRange.min} onChange={(e) => setSalaryRange({...salaryRange, min: e.target.value})}
                        className="h-9"
                      />
                      <Input 
                        type="number" placeholder="Max" 
                        value={salaryRange.max} onChange={(e) => setSalaryRange({...salaryRange, max: e.target.value})}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ordenar por</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="dateDesc">Más Recientes</option>
                      <option value="dateAsc">Más Antiguos</option>
                      <option value="nameAsc">Nombre (A-Z)</option>
                      <option value="nameDesc">Nombre (Z-A)</option>
                    </select>
                  </div>
                </div>
              )}
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
                          className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm"
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
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(employee);
                                }}
                                className="rounded-lg border-border text-xs hover:bg-muted/50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(employee.employee_id);
                                }}
                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 bg-card/50">
                  <span className="text-sm text-muted-foreground font-medium">
                    Página <strong className="text-foreground">{currentPage}</strong> de {totalPages} ({totalItems} empleados)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border-border"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border-border"
                    >
                      Siguiente
                    </Button>
                  </div>
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
                      {rolesList.map((dept) => (
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
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, salary_per_event: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0)})}
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

      {/* Edit Employee Modal */}
      {editModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-lg rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Editar empleado
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingEmployee.first_name} {editingEmployee.last_name}
                </p>
              </div>
              <button
                onClick={() => { setEditModalOpen(false); setEditingEmployee(null); }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Nombre</Label>
                  <Input
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Apellido</Label>
                  <Input
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Correo electrónico</Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Teléfono</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Rol</Label>
                  <div className="relative">
                    <select
                      value={editFormData.rol}
                      onChange={(e) => setEditFormData({...editFormData, rol: e.target.value})}
                      className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="">Seleccionar...</option>
                      {rolesList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Tarifa por Evento ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormData.salary_per_event}
                    onChange={(e) => setEditFormData({...editFormData, salary_per_event: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0)})}
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Estado</Label>
                  <div className="relative">
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
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
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => { setEditModalOpen(false); setEditingEmployee(null); }}
                  className="rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateEmployee}
                  className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-sm rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Eliminar empleado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="flex-1 rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={executeDeleteEmployee}
                  className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
