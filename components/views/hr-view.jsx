"use client";
import { useState } from "react";
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
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const employees = [
  {
    id: 1,
    name: "Ana Lopez",
    role: "Coordinadora de eventos",
    department: "Eventos",
    email: "ana.lopez@mediterraneo.com",
    phone: "+34 612 111 222",
    hireDate: "15 Mar 2022",
    status: "Activo",
    assignments: [
      { event: "Boda Garc\xEDa", date: "15 Dec 2026", venue: "Villa Rosemary" },
      { event: "Gala Navide\xF1a", date: "22 Dec 2026", venue: "Grand Hall" },
      { event: "Fiesta de A\xF1o Nuevo", date: "31 Dec 2026", venue: "Sunset Beach" }
    ]
  },
  {
    id: 2,
    name: "Miguel Santos",
    role: "Chef Principal",
    department: "Catering",
    email: "miguel.santos@mediterraneo.com",
    phone: "+34 612 222 333",
    hireDate: "10 Jan 2021",
    status: "Activo",
    assignments: [
      { event: "Boda Garc\xEDa", date: "15 Dec 2026", venue: "Villa Rosemary" },
      { event: "Reuni\xF3n Tech Corp", date: "18 Dec 2026", venue: "Coastal Resort" }
    ]
  },
  {
    id: 3,
    name: "Laura Fernandez",
    role: "Gerente de bar",
    department: "Bar",
    email: "laura.fernandez@mediterraneo.com",
    phone: "+34 612 333 444",
    hireDate: "20 Jun 2023",
    status: "Activo",
    assignments: [
      { event: "Gala Navide\xF1a", date: "22 Dec 2026", venue: "Grand Hall" },
      { event: "Fiesta de A\xF1o Nuevo", date: "31 Dec 2026", venue: "Sunset Beach" }
    ]
  },
  {
    id: 4,
    name: "David Ruiz",
    role: "Decorador",
    department: "Dise\xF1o",
    email: "david.ruiz@mediterraneo.com",
    phone: "+34 612 444 555",
    hireDate: "5 Sep 2022",
    status: "Activo",
    assignments: [
      { event: "Boda Garc\xEDa", date: "15 Dec 2026", venue: "Villa Rosemary" },
      { event: "Bautizo Mart\xEDnez", date: "20 Dec 2026", venue: "Garden Terrace" }
    ]
  },
  {
    id: 5,
    name: "Carmen Vega",
    role: "Representante de ventas",
    department: "Ventas",
    email: "carmen.vega@mediterraneo.com",
    phone: "+34 612 555 666",
    hireDate: "28 Feb 2026",
    status: "Activo",
    assignments: []
  },
  {
    id: 6,
    name: "Pablo Moreno",
    role: "Asistente de log\xEDstica",
    department: "Operaciones",
    email: "pablo.moreno@mediterraneo.com",
    phone: "+34 612 666 777",
    hireDate: "12 Aug, 2023",
    status: "De baja",
    assignments: []
  }
];
const roles = [
  { name: "Coordinadores de eventos", count: 3 },
  { name: "Chefs", count: 4 },
  { name: "Staff de bar", count: 6 },
  { name: "Decoradores", count: 2 },
  { name: "Ventas", count: 2 },
  { name: "Operaciones", count: 3 }
];
const departments = ["Todos", "Eventos", "Catering", "Bar", "Dise\xF1o", "Ventas", "Operaciones"];
const statusColors = {
  Activo: "bg-[#6b705c] text-white",
  "De baja": "bg-[#d4a574] text-white",
  Inactivo: "bg-[#c05c3c]/10 text-[#c05c3c]"
};
export function HRView() {
  const [activeTab, setActiveTab] = useState("directory");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Todos");
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "Todos" || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });
  const upcomingAssignments = employees.flatMap(
    (employee) => employee.assignments.map((assignment) => ({
      ...assignment,
      employeeName: employee.name,
      employeeRole: employee.role,
      employeeId: employee.id
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return <div className="space-y-8">
      {
    /* Header */
  }
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Recursos Humanos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona empleados, roles y asignaciones.
          </p>
        </div>
        <Button
    onClick={() => setModalOpen(true)}
    className="rounded-xl bg-[#c05c3c] text-white shadow-md hover:bg-[#a84d32]"
  >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
      </div>

      {
    /* Stats */
  }
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none shadow-md">
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
        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6b705c]">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter((e) => e.status === "Active").length}
                </p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4a574]">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter((e) => e.status === "On Leave").length}
                </p>
                <p className="text-sm text-muted-foreground">De baja</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
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

      {
    /* Tabs */
  }
      <div className="flex flex-wrap gap-2 rounded-2xl bg-card/70 p-2">
        <button
    onClick={() => setActiveTab("directory")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === "directory" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
          <UserCog className="h-4 w-4" />
          Directorio
        </button>
        <button
    onClick={() => setActiveTab("assignments")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === "assignments" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
          <Calendar className="h-4 w-4" />
          Asignaciones
        </button>
      </div>

      {
    /* Directory View */
  }
      {activeTab === "directory" && <>
          {
    /* Search & Filter */
  }
          <Card className="rounded-2xl border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
    placeholder="Buscar empleados por nombre o rol..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
                <div className="relative w-full sm:w-48">
                  <select
    value={filterDepartment}
    onChange={(e) => setFilterDepartment(e.target.value)}
    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
  >
                    {departments.map((dept) => <option key={dept} value={dept}>
                        {dept}
                      </option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {
    /* Roles Overview */
  }
          <Card className="rounded-2xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Resumen de roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {roles.map((role) => <div
    key={role.name}
    className="flex items-center gap-2 rounded-xl bg-card/80 px-4 py-2"
  >
                    <span className="text-sm font-medium text-foreground">
                      {role.name}
                    </span>
                    <span className="rounded-full bg-[#1d3557] px-2 py-0.5 text-xs text-white">
                      {role.count}
                    </span>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {
    /* Employees Table */
  }
          <Card className="overflow-hidden rounded-2xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Directorio de empleados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEmployees.map((employee) => <tr
    key={employee.id}
    className="transition-colors hover:bg-muted/50"
  >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3557]/10">
                              <span className="text-sm font-semibold text-[#1d3557]">
                                {employee.name.split(" ").map((n) => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {employee.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {employee.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">{employee.role}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">
                            {employee.hireDate}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[employee.status]}`}
  >
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
    variant="outline"
    size="sm"
    className="rounded-lg border-border text-xs hover:bg-muted/50"
  >
                            Ver perfil
                          </Button>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>}

      {
    /* Assignments View */
  }
      {activeTab === "assignments" && <div className="space-y-6">
          {
    /* Upcoming Assignments */
  }
          <Card className="rounded-2xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-[#c05c3c]" />
                Próximas asignaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length > 0 ? <div className="space-y-4">
                  {upcomingAssignments.map((assignment, index) => <div
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
                    </div>)}
                </div> : <div className="rounded-xl bg-card/80 p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium text-foreground">
                    No hay asignaciones próximas
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Las asignaciones aparecerán aquí una vez que se creen eventos.
                  </p>
                </div>}
            </CardContent>
          </Card>

          {
    /* Assignments by Employee */
  }
          <Card className="rounded-2xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Asignaciones por empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.filter((e) => e.assignments.length > 0).map((employee) => <Card
    key={employee.id}
    className="overflow-hidden rounded-xl border border-border shadow-sm"
  >
                      <CardHeader className="bg-[#1d3557] pb-3 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                            <span className="text-sm font-semibold text-white">
                              {employee.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{employee.name}</p>
                            <p className="text-xs text-white/70">{employee.role}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Eventos próximos ({employee.assignments.length})
                        </p>
                        <div className="space-y-2">
                          {employee.assignments.map((assignment, idx) => <div
    key={idx}
    className="rounded-lg bg-card/80 p-3"
  >
                              <p className="font-medium text-foreground">
                                {assignment.event}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {assignment.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {assignment.venue}
                                </span>
                              </div>
                            </div>)}
                        </div>
                      </CardContent>
                    </Card>)}
              </div>
            </CardContent>
          </Card>
        </div>}

      {
    /* Add Employee Modal */
  }
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-none shadow-2xl">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Nombre completo
                </Label>
                <Input
    placeholder="Nombre del empleado"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input
    type="email"
    placeholder="correo@mediterraneo.com"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Department
                  </Label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]">
                      <option value="">Select...</option>
                      {departments.slice(1).map((dept) => <option key={dept} value={dept}>
                          {dept}
                        </option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Rol</Label>
                  <Input
    placeholder="Rol del empleado"
    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
  />
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
    onClick={() => setModalOpen(false)}
    className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
  >
                  Crear Empleado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}
