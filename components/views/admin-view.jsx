'use client'
import { useState, useEffect } from 'react'
import { apiClient, extractList } from '@/lib/api-client'
import { venueService } from '@/lib/services/venue.service'
import { serviceExternalService } from '@/lib/services/serviceExternal.service'
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
  Trash2,
  SlidersHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const roles = [
  'Administradores',
  'Coordinadores',
  'Chefs',
  'Gerentes de bar',
  'Ventas',
  'Operaciones',
]
const venueStatuses = ['Available', 'Occupied', 'Maintenance', 'Reserved']
const statusLabels = {
  Available: 'Disponible',
  Occupied: 'Ocupado',
  Maintenance: 'Mantenimiento',
  Reserved: 'Reservado',
}
const statusColors = {
  Activo: 'bg-[#6b705c] text-white',
  Inactivo: 'bg-card/80 text-[#6b705c]',
  active: 'bg-[#6b705c] text-white',
  inactive: 'bg-card/80 text-[#6b705c]',
  suspended: 'bg-[#c05c3c]/10 text-[#c05c3c]',
  Available: 'bg-[#6b705c] text-white',
  Occupied: 'bg-[#c05c3c] text-white',
  Maintenance: 'bg-[#d4a574] text-white',
  Reserved: 'bg-[#1d3557] text-white',
}

export function AdminView() {
  const [activeTab, setActiveTab] = useState('users')
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role_id: 1 })
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [venueModalOpen, setVenueModalOpen] = useState(false)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)

  // States for Users & Roles
  const [users, setUsers] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersFilterRole, setUsersFilterRole] = useState("All")
  const [usersFilterStatus, setUsersFilterStatus] = useState("All")
  const [showUsersFilters, setShowUsersFilters] = useState(false)

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiClient.get('/users')
      if (!response.error) {
        setUsers(extractList(response.data))
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await apiClient.get('/roles')
      if (!response.error) {
        const roles = extractList(response.data)
        const seen = new Set()
        const synonymMap = { 'admin': 'administrador' }
        const uniqueRoles = []
        for (const r of roles) {
          const key = r.role_name?.toLowerCase().trim()
          if (!key) continue
          const resolvedKey = (synonymMap[key] || key)
          if (seen.has(resolvedKey)) continue
          seen.add(resolvedKey)
          const displayName = r.role_name
          uniqueRoles.push({
            ...r,
            role_name: synonymMap[key] ? 'Administrador' : displayName
          })
        }
        setRolesList(uniqueRoles)
      }
    } catch (err) {
      console.error('Error al cargar roles:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
      loadRoles()
    }
    else if (activeTab === 'venues') loadVenues()
    else if (activeTab === 'services') loadServices()
  }, [activeTab])

  // States for Venues
  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [venueForm, setVenueForm] = useState({ name: "", capacity: "", status: "Available", base_price: "" })
  const [isSavingVenue, setIsSavingVenue] = useState(false)
  const [venueImage, setVenueImage] = useState(null)
  const [venuesSearch, setVenuesSearch] = useState("")
  const [venuesFilterStatus, setVenuesFilterStatus] = useState("All")
  const [showVenuesFilters, setShowVenuesFilters] = useState(false)

  // States for Services
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState({ name: "", service_type: "", base_price: "", provider_info: "" })
  const [isSavingService, setIsSavingService] = useState(false)
  const [serviceImage, setServiceImage] = useState(null)
  const [servicesSearch, setServicesSearch] = useState("")
  const [servicesFilterType, setServicesFilterType] = useState("All")
  const [showServicesFilters, setShowServicesFilters] = useState(false)

  const loadVenues = async () => {
    try {
      setLoadingVenues(true)
      const response = await venueService.getAll()
      if (!response.error) setVenues(extractList(response.data))
    } catch (err) {
      console.error("Error al cargar salones:", err)
    } finally {
      setLoadingVenues(false)
    }
  }

  const loadServices = async () => {
    try {
      setLoadingServices(true)
      const response = await serviceExternalService.getAll()
      if (!response.error) setServices(extractList(response.data))
    } catch (err) {
      console.error("Error al cargar servicios:", err)
    } finally {
      setLoadingServices(false)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank for edit unless they want to change it
      role_id: user.role_id || 1,
    })
    setUserModalOpen(true)
  }

  const handleCreateNewUser = () => {
    setEditingUser(null)
    setUserForm({ name: '', email: '', password: '', role_id: 1 })
    setUserModalOpen(true)
  }

  const handleSaveUser = async () => {
    setIsSavingUser(true)
    try {
      let res
      if (editingUser) {
        const payload = { ...userForm }
        if (!payload.password) delete payload.password // Don't send empty password
        res = await apiClient.put(`/users/${editingUser.user_id}`, payload)
      } else {
        res = await apiClient.post(`/auth/register`, userForm)
      }

      if (res && res.error) {
        alert(`Error: ${res.error}`)
        return
      }

      setUserModalOpen(false)
      loadUsers()
    } catch (err) {
      alert('Error al guardar el usuario')
      console.error(err)
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await apiClient.delete(`/users/${id}`)
        loadUsers()
      } catch (err) {
        alert('Error al eliminar el usuario')
      }
    }
  }

  // --- VENUE HANDLERS ---
  const handleEditVenue = (venue) => {
    setEditingVenue(venue)
    setVenueForm({
      name: venue.name || '',
      capacity: venue.capacity || '',
      status: venue.status || 'Available',
      base_price: venue.base_price || '',
    })
    setVenueImage(null)
    setVenueModalOpen(true)
  }

  const handleCreateNewVenue = () => {
    setEditingVenue(null)
    setVenueForm({ name: '', capacity: '', status: 'Available', base_price: '' })
    setVenueImage(null)
    setVenueModalOpen(true)
  }

  const handleSaveVenue = async () => {
    setIsSavingVenue(true)
    try {
      const formData = new FormData()
      formData.append('name', venueForm.name)
      formData.append('capacity', venueForm.capacity)
      formData.append('status', venueForm.status)
      if (venueForm.base_price) formData.append('base_price', venueForm.base_price)
      if (venueImage) formData.append('image', venueImage)

      let res
      if (editingVenue) {
        res = await venueService.update(editingVenue.venue_id, formData)
      } else {
        res = await venueService.create(formData)
      }
      if (res && res.error) {
        alert('Error: ' + res.error)
        return
      }
      setVenueModalOpen(false)
      loadVenues()
    } catch (err) {
      alert('Error al guardar el salón')
    } finally {
      setIsSavingVenue(false)
    }
  }

  const handleDeleteVenue = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este salón?')) {
      try {
        await venueService.delete(id)
        loadVenues()
      } catch (err) {
        alert('Error al eliminar el salón')
      }
    }
  }

  // --- SERVICE HANDLERS ---
  const handleEditService = (service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name || '',
      service_type: service.service_type || '',
      base_price: service.base_price || '',
      provider_info: service.provider_info || '',
    })
    setServiceImage(null)
    setServiceModalOpen(true)
  }

  const handleCreateNewService = () => {
    setEditingService(null)
    setServiceForm({ name: '', service_type: '', base_price: '', provider_info: '' })
    setServiceImage(null)
    setServiceModalOpen(true)
  }

  const handleSaveService = async () => {
    setIsSavingService(true)
    try {
      const formData = new FormData()
      formData.append('name', serviceForm.name)
      formData.append('service_type', serviceForm.service_type)
      if (serviceForm.base_price) formData.append('base_price', serviceForm.base_price)
      if (serviceForm.provider_info) formData.append('provider_info', serviceForm.provider_info)
      if (serviceImage) formData.append('image', serviceImage)

      let res
      if (editingService) {
        res = await serviceExternalService.update(editingService.service_id, formData)
      } else {
        res = await serviceExternalService.create(formData)
      }
      if (res && res.error) {
        alert('Error: ' + res.error)
        return
      }
      setServiceModalOpen(false)
      loadServices()
    } catch (err) {
      alert('Error al guardar el servicio')
    } finally {
      setIsSavingService(false)
    }
  }

  const handleDeleteService = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        const res = await serviceExternalService.delete(id)
        if (res && res.error) throw new Error(res.error)
        loadServices()
      } catch (err) {
        alert('Error al eliminar: ' + err.message)
      }
    }
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Administración</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona usuarios, salones y servicios externos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-card/40 p-2 backdrop-blur-md shadow-sm border border-border/50">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'text-foreground hover:bg-muted/50 hover:scale-105'}`}
          >
            <Users className="h-4 w-4" />
            Usuarios y Permisos
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === 'venues' ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'text-foreground hover:bg-muted/50 hover:scale-105'}`}
          >
            <Building className="h-4 w-4" />
            Salones
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === 'services' ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'text-foreground hover:bg-muted/50 hover:scale-105'}`}
          >
            <Briefcase className="h-4 w-4" />
            Servicios Externos
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 p-4 rounded-2xl border border-white/10 shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUsersFilters(!showUsersFilters)}
                  className={`h-9 rounded-lg border-border transition-all ${showUsersFilters ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'hover:bg-muted/50'}`}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button
                  onClick={handleCreateNewUser}
                  className="h-9 rounded-lg bg-[#c05c3c] text-white shadow-md hover:bg-[#a84d32] px-4 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo usuario
                </Button>
              </div>
            </div>

            {showUsersFilters && (
              <Card className="glass-panel rounded-2xl animate-in slide-in-from-top-2">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rol</Label>
                    <select
                      value={usersFilterRole}
                      onChange={(e) => setUsersFilterRole(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="All">Todos</option>
                      {rolesList.map((r) => (
                        <option key={r.id} value={String(r.id)}>{r.role_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</Label>
                    <select
                      value={usersFilterStatus}
                      onChange={(e) => setUsersFilterStatus(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="All">Todos</option>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      ) : (() => {
                        const filteredUsers = users.filter((u) => {
                          const term = usersSearch.toLowerCase()
                          const matchSearch = (u.name || "").toLowerCase().includes(term) || (u.email || "").toLowerCase().includes(term)
                          const matchRole = usersFilterRole === "All" || String(u.role_id) === usersFilterRole
                          const matchStatus = usersFilterStatus === "All" || u.status === usersFilterStatus
                          return matchSearch && matchRole && matchStatus
                        })

                        if (filteredUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">
                                No se encontraron usuarios.
                              </td>
                            </tr>
                          )
                        }

                        return filteredUsers.map((user) => (
                          <tr
                            key={user.user_id}
                            className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d3557]/20 to-[#1d3557]/5 border border-[#1d3557]/10">
                                  <span className="text-sm font-semibold text-[#1d3557]">
                                    {(user.name || "U")
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
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
                                <span className="text-sm text-foreground">
                                  {user.Role?.role_name || user.Role?.name || 'Administrador'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">
                                {user.create_at || user.createdAt
                                  ? new Date(user.create_at || user.createdAt).toLocaleDateString()
                                  : 'No registrado'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[user.status] || 'bg-gray-200'}`}
                              >
                                {user.status === 'active'
                                  ? 'Activo'
                                  : user.status === 'inactive'
                                    ? 'Inactivo'
                                    : user.status === 'suspended'
                                      ? 'Suspendido'
                                      : user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
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
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Venues Tab */}
        {activeTab === 'venues' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 p-4 rounded-2xl border border-white/10 shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar salones..."
                  value={venuesSearch}
                  onChange={(e) => setVenuesSearch(e.target.value)}
                  className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowVenuesFilters(!showVenuesFilters)}
                  className={`h-9 rounded-lg border-border transition-all ${showVenuesFilters ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'hover:bg-muted/50'}`}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button
                  onClick={handleCreateNewVenue}
                  className="h-9 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo salón
                </Button>
              </div>
            </div>

            {showVenuesFilters && (
              <Card className="glass-panel rounded-2xl animate-in slide-in-from-top-2">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</Label>
                    <select
                      value={venuesFilterStatus}
                      onChange={(e) => setVenuesFilterStatus(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="All">Todos</option>
                      {venueStatuses.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loadingVenues ? (
                <p className="text-muted-foreground p-4">Cargando salones...</p>
              ) : (() => {
                const filteredVenues = venues.filter((v) => {
                  const term = venuesSearch.toLowerCase()
                  const matchSearch = (v.name || "").toLowerCase().includes(term)
                  const matchStatus = venuesFilterStatus === "All" || v.status === venuesFilterStatus
                  return matchSearch && matchStatus
                })

                if (filteredVenues.length === 0) {
                  return <p className="text-muted-foreground p-4">No se encontraron salones.</p>
                }

                return filteredVenues.map((venue) => (
                  <Card
                    key={venue.venue_id || Math.random()}
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
                          {statusLabels[venue.status] || venue.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {venue.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#6b705c]">{venue.capacity}</p>
                          <p className="text-xs text-muted-foreground">Capacidad</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#c05c3c]">${venue.base_price || 0}</p>
                          <p className="text-xs text-muted-foreground">Precio Base</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditVenue(venue)}
                          className="flex-1 rounded-xl border-border hover:bg-muted/50"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteVenue(venue.venue_id)}
                          className="rounded-xl border-[#c05c3c] text-[#c05c3c] hover:bg-[#c05c3c]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              })()}
            </div>
          </div>
        )}

        {/* External Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 p-4 rounded-2xl border border-white/10 shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={servicesSearch}
                  onChange={(e) => setServicesSearch(e.target.value)}
                  className="h-9 rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowServicesFilters(!showServicesFilters)}
                  className={`h-9 rounded-lg border-border transition-all ${showServicesFilters ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'hover:bg-muted/50'}`}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button
                  onClick={handleCreateNewService}
                  className="h-9 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo servicio
                </Button>
              </div>
            </div>

            {showServicesFilters && (
              <Card className="glass-panel rounded-2xl animate-in slide-in-from-top-2">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</Label>
                    <select
                      value={servicesFilterType}
                      onChange={(e) => setServicesFilterType(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                    >
                      <option value="All">Todos</option>
                      {Array.from(new Set(services.map(s => s.service_type))).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      {loadingServices ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Cargando servicios...
                          </td>
                        </tr>
                      ) : (() => {
                        const filteredServices = services.filter((s) => {
                          const term = servicesSearch.toLowerCase()
                          const matchSearch = (s.name || "").toLowerCase().includes(term) || (s.provider_info || "").toLowerCase().includes(term)
                          const matchType = servicesFilterType === "All" || s.service_type === servicesFilterType
                          return matchSearch && matchType
                        })

                        if (filteredServices.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" className="p-4 text-center">
                                No se encontraron servicios externos.
                              </td>
                            </tr>
                          )
                        }

                        return filteredServices.map((service) => (
                          <tr
                            key={service.service_id || Math.random()}
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
                                {service.service_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">
                                {service.provider_info}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-[#6b705c]">${service.base_price}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditService(service)}
                                  className="rounded-lg border-border hover:bg-muted/50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteService(service.service_id || service.id)}
                                  className="rounded-lg border-[#c05c3c] text-[#c05c3c] hover:bg-[#c05c3c]/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Nombre completo"
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Correo electrónico</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Contraseña {editingUser && '(Dejar en blanco para mantener actual)'}
                </Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="********"
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Rol</Label>
                <div className="relative">
                  <select
                    value={userForm.role_id}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role_id: parseInt(e.target.value) })
                    }
                    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.role_name}
                        </option>
                      ))
                    ) : (
                      <option value={1}>Cargando roles...</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setUserModalOpen(false)}
                  disabled={isSavingUser}
                  className="rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={isSavingUser}
                  className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
                >
                  {isSavingUser
                    ? 'Guardando...'
                    : editingUser
                      ? 'Actualizar Usuario'
                      : 'Crear Usuario'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Venue Modal */}
      {venueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                {editingVenue ? 'Editar Salón' : 'Nuevo Salón'}
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
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Estado</Label>
                <div className="relative">
                  <select
                    value={venueForm.status}
                    onChange={(e) => setVenueForm({ ...venueForm, status: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
                  >
                    {venueStatuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Capacidad</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={venueForm.capacity}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, capacity: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Precio Base ($)</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={venueForm.base_price}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, base_price: parseFloat(e.target.value) || 0 })
                    }
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Imagen del salón (Opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVenueImage(e.target.files[0])}
                  className="rounded-xl border-input cursor-pointer focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setVenueModalOpen(false)}
                  disabled={isSavingVenue}
                  className="rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveVenue}
                  disabled={isSavingVenue}
                  className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
                >
                  {isSavingVenue
                    ? 'Guardando...'
                    : editingVenue
                      ? 'Actualizar Salón'
                      : 'Crear Salón'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-card shadow-2xl shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                <Label className="text-sm font-medium text-foreground">Proveedor</Label>
                <Input
                  placeholder="Nombre de empresa"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Tipo de servicio</Label>
                <Input
                  placeholder="Catering, DJ, Fotografía..."
                  value={serviceForm.service_type}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })}
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Contacto</Label>
                <Input
                  placeholder="Datos de contacto o información"
                  value={serviceForm.provider_info}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, provider_info: e.target.value })
                  }
                  className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Precio base</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={serviceForm.base_price}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        base_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-xl border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Imagen del servicio (Opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setServiceImage(e.target.files[0])}
                  className="rounded-xl border-input cursor-pointer focus:ring-2 focus:ring-[#c05c3c]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setServiceModalOpen(false)}
                  disabled={isSavingService}
                  className="rounded-xl border-border"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveService}
                  disabled={isSavingService}
                  className="rounded-xl bg-[#c05c3c] text-white hover:bg-[#a84d32]"
                >
                  {isSavingService
                    ? 'Guardando...'
                    : editingService
                      ? 'Actualizar Servicio'
                      : 'Crear Servicio'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
