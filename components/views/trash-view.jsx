import { useState, useEffect } from 'react'
import { apiClient, extractList } from '@/lib/api-client'
import { venueService } from '@/lib/services/venue.service'
import { serviceExternalService } from '@/lib/services/serviceExternal.service'
import { clientService } from '@/lib/services/client.service'
import { eventService } from '@/lib/services/event.service'
import { employeeService } from '@/lib/services/employee.service'
import { productService } from '@/lib/services/product.service'
import { providerService } from '@/lib/services/provider.service'

import {
  Users,
  Building,
  Briefcase,
  Trash2,
  RefreshCw,
  Search,
  Package,
  Calendar,
  Contact,
  Truck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function TrashView() {
  const [activeTab, setActiveTab] = useState('users')
  
  // Data States
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')

  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [searchVenues, setSearchVenues] = useState('')

  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [searchServices, setSearchServices] = useState('')

  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [searchClients, setSearchClients] = useState('')

  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [searchEvents, setSearchEvents] = useState('')

  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [searchEmployees, setSearchEmployees] = useState('')

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchProducts, setSearchProducts] = useState('')

  const [providers, setProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [searchProviders, setSearchProviders] = useState('')

  // Loaders
  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiClient.get('/users?deleted=true')
      if (!response.error) setUsers(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadVenues = async () => {
    try {
      setLoadingVenues(true)
      const response = await venueService.getAll({ deleted: true })
      if (!response.error) setVenues(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar salones:', err)
    } finally {
      setLoadingVenues(false)
    }
  }

  const loadServices = async () => {
    try {
      setLoadingServices(true)
      const response = await serviceExternalService.getAll({ deleted: true })
      if (!response.error) setServices(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar servicios:', err)
    } finally {
      setLoadingServices(false)
    }
  }

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const response = await clientService.getAll({ deleted: true })
      if (!response.error) setClients(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar clientes:', err)
    } finally {
      setLoadingClients(false)
    }
  }

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await eventService.getAll({ deleted: true })
      if (!response.error) setEvents(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar eventos:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await employeeService.getAll({ deleted: true })
      if (!response.error) setEmployees(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar empleados:', err)
    } finally {
      setLoadingEmployees(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await productService.getAll({ deleted: true })
      if (!response.error) setProducts(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar productos:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await providerService.getAll({ deleted: true })
      if (!response.error) setProviders(extractList(response.data))
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    } finally {
      setLoadingProviders(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    else if (activeTab === 'venues') loadVenues()
    else if (activeTab === 'services') loadServices()
    else if (activeTab === 'clients') loadClients()
    else if (activeTab === 'events') loadEvents()
    else if (activeTab === 'employees') loadEmployees()
    else if (activeTab === 'products') loadProducts()
    else if (activeTab === 'providers') loadProviders()
  }, [activeTab])

  // Restorers
  const handleRestoreUser = async (id) => {
    try {
      await apiClient.put(`/users/${id}/restore`)
      toast.success('Usuario restaurado exitosamente')
      loadUsers()
    } catch (err) {
      toast.error('Error al restaurar el usuario')
    }
  }

  const handleRestoreVenue = async (id) => {
    try {
      await venueService.restore(id)
      toast.success('Salón restaurado exitosamente')
      loadVenues()
    } catch (err) {
      toast.error('Error al restaurar el salón')
    }
  }

  const handleRestoreService = async (id) => {
    try {
      await serviceExternalService.restore(id)
      toast.success('Servicio restaurado exitosamente')
      loadServices()
    } catch (err) {
      toast.error('Error al restaurar el servicio')
    }
  }

  const handleRestoreClient = async (id) => {
    try {
      await clientService.restore(id)
      toast.success('Cliente restaurado exitosamente')
      loadClients()
    } catch (err) {
      toast.error('Error al restaurar el cliente')
    }
  }

  const handleRestoreEvent = async (id) => {
    try {
      await eventService.restore(id)
      toast.success('Evento restaurado exitosamente')
      loadEvents()
    } catch (err) {
      toast.error('Error al restaurar el evento')
    }
  }

  const handleRestoreEmployee = async (id) => {
    try {
      await employeeService.restore(id)
      toast.success('Empleado restaurado exitosamente')
      loadEmployees()
    } catch (err) {
      toast.error('Error al restaurar el empleado')
    }
  }

  const handleRestoreProduct = async (id) => {
    try {
      await productService.restore(id)
      toast.success('Producto restaurado exitosamente')
      loadProducts()
    } catch (err) {
      toast.error('Error al restaurar el producto')
    }
  }

  const handleRestoreProvider = async (id) => {
    try {
      await providerService.restore(id)
      toast.success('Proveedor restaurado exitosamente')
      loadProviders()
    } catch (err) {
      toast.error('Error al restaurar el proveedor')
    }
  }

  const getTabClass = (tabId) => `flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeTab === tabId ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'text-foreground hover:bg-muted/50 hover:scale-105'}`

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-[#c05c3c]" />
          Papelera de Reciclaje
        </h1>
        <p className="mt-1 text-muted-foreground">
          Los elementos eliminados permanecerán aquí durante 30 días antes de ser purgados permanentemente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-card/40 p-2 backdrop-blur-md shadow-sm border border-border/50">
        <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>
          <Users className="h-4 w-4" /> Usuarios
        </button>
        <button onClick={() => setActiveTab('clients')} className={getTabClass('clients')}>
          <Contact className="h-4 w-4" /> Clientes
        </button>
        <button onClick={() => setActiveTab('events')} className={getTabClass('events')}>
          <Calendar className="h-4 w-4" /> Eventos
        </button>
        <button onClick={() => setActiveTab('employees')} className={getTabClass('employees')}>
          <Briefcase className="h-4 w-4" /> Empleados
        </button>
        <button onClick={() => setActiveTab('products')} className={getTabClass('products')}>
          <Package className="h-4 w-4" /> Productos
        </button>
        <button onClick={() => setActiveTab('providers')} className={getTabClass('providers')}>
          <Truck className="h-4 w-4" /> Proveedores
        </button>
        <button onClick={() => setActiveTab('venues')} className={getTabClass('venues')}>
          <Building className="h-4 w-4" /> Salones
        </button>
        <button onClick={() => setActiveTab('services')} className={getTabClass('services')}>
          <Briefcase className="h-4 w-4" /> Servicios Externos
        </button>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar...`}
            value={
              activeTab === 'users' ? searchUsers :
              activeTab === 'venues' ? searchVenues :
              activeTab === 'services' ? searchServices :
              activeTab === 'clients' ? searchClients :
              activeTab === 'events' ? searchEvents :
              activeTab === 'employees' ? searchEmployees :
              activeTab === 'products' ? searchProducts :
              searchProviders
            }
            onChange={(e) => {
              const val = e.target.value
              if (activeTab === 'users') setSearchUsers(val)
              else if (activeTab === 'venues') setSearchVenues(val)
              else if (activeTab === 'services') setSearchServices(val)
              else if (activeTab === 'clients') setSearchClients(val)
              else if (activeTab === 'events') setSearchEvents(val)
              else if (activeTab === 'employees') setSearchEmployees(val)
              else if (activeTab === 'products') setSearchProducts(val)
              else if (activeTab === 'providers') setSearchProviders(val)
            }}
            className="pl-9 rounded-xl focus:ring-[#c05c3c]"
          />
        </div>
        
        <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-card/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nombre / Detalle</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Información Extra</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Fecha de Eliminación</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(() => {
                    const renderRow = (item, id, name, extra, restoreHandler) => (
                      <tr key={id} className="hover:bg-muted/60">
                        <td className="px-6 py-4 font-medium">{name}</td>
                        <td className="px-6 py-4">{extra}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(item.deleted_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Button variant="outline" size="sm" onClick={() => restoreHandler(id)} className="rounded-lg text-[#6b705c] border-[#6b705c] hover:bg-[#6b705c]/10">
                            <RefreshCw className="h-4 w-4 mr-2" /> Restaurar
                          </Button>
                        </td>
                      </tr>
                    )

                    const emptyRow = <tr><td colSpan="4" className="text-center p-4 text-muted-foreground">La papelera está vacía.</td></tr>
                    const loadingRow = <tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>

                    if (activeTab === 'users') {
                      if (loadingUsers) return loadingRow
                      const filtered = users.filter(u => (u.name || '').toLowerCase().includes(searchUsers.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.user_id, item.name, item.Role?.role_name || 'Admin', handleRestoreUser))
                    }
                    if (activeTab === 'venues') {
                      if (loadingVenues) return loadingRow
                      const filtered = venues.filter(v => (v.name || '').toLowerCase().includes(searchVenues.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.venue_id, item.name, item.capacity + ' personas', handleRestoreVenue))
                    }
                    if (activeTab === 'services') {
                      if (loadingServices) return loadingRow
                      const filtered = services.filter(s => (s.name || '').toLowerCase().includes(searchServices.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.service_id || item.id, item.name, item.service_type, handleRestoreService))
                    }
                    if (activeTab === 'clients') {
                      if (loadingClients) return loadingRow
                      const filtered = clients.filter(c => (c.name || '').toLowerCase().includes(searchClients.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.client_id, item.name, item.email, handleRestoreClient))
                    }
                    if (activeTab === 'events') {
                      if (loadingEvents) return loadingRow
                      const filtered = events.filter(e => (e.Client?.name || e.event_id || '').toString().toLowerCase().includes(searchEvents.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.event_id, item.Client?.name || 'Evento sin cliente', item.type_event || 'Evento', handleRestoreEvent))
                    }
                    if (activeTab === 'employees') {
                      if (loadingEmployees) return loadingRow
                      const filtered = employees.filter(e => (e.name || '').toLowerCase().includes(searchEmployees.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.employee_id, item.name, item.department, handleRestoreEmployee))
                    }
                    if (activeTab === 'products') {
                      if (loadingProducts) return loadingRow
                      const filtered = products.filter(p => (p.name || '').toLowerCase().includes(searchProducts.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.product_id, item.name, item.category, handleRestoreProduct))
                    }
                    if (activeTab === 'providers') {
                      if (loadingProviders) return loadingRow
                      const filtered = providers.filter(p => (p.name || '').toLowerCase().includes(searchProviders.toLowerCase()))
                      if (!filtered.length) return emptyRow
                      return filtered.map(item => renderRow(item, item.provider_id, item.name, item.contact_phone, handleRestoreProvider))
                    }
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
