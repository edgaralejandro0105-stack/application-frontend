"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Plus,
  Search,
  ShoppingCart,
  Banknote,
  Calendar,
  X,
  TrendingUp,
  Download,
  Loader2,
  SlidersHorizontal,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { saleService } from "@/lib/services/sale.service";
import { reportService } from "@/lib/services/report.service";
import { extractList } from "@/lib/api-client";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";

export function SalesList() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("dateDesc");
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSaleDetails, setSelectedSaleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await saleService.getAll({ limit: 10000 });
        if (res.error) throw new Error(res.error);
        
        // Simular algunos datos históricos si la API devuelve poco, 
        // solo para que el gráfico se vea bien, o usar los reales.
        const fetchedSales = extractList(res.data);
        setSales(fetchedSales);
      } catch (err) {
        setError(err.message || "Error al cargar las ventas");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const eventName = sale.Event?.name?.toLowerCase() || `evento ${sale.event_id}`;
    const transactionId = `#${String(sale.sale_id).padStart(5, '0')}`;
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = eventName.includes(term) || transactionId.includes(term);

    // Date Range
    let matchesDate = true;
    const saleDate = new Date(sale.create_at || sale.createdAt);
    if (dateRange.from) {
      matchesDate = matchesDate && saleDate >= new Date(dateRange.from);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && saleDate <= toDate;
    }

    // Amount Range
    let matchesAmount = true;
    const amount = Number(sale.total) || 0;
    if (amountRange.min) {
      matchesAmount = matchesAmount && amount >= Number(amountRange.min);
    }
    if (amountRange.max) {
      matchesAmount = matchesAmount && amount <= Number(amountRange.max);
    }

    return matchesSearch && matchesDate && matchesAmount;
  }).sort((a, b) => {
    if (sortBy === "dateDesc") {
      return new Date(b.create_at || b.createdAt) - new Date(a.create_at || a.createdAt);
    }
    if (sortBy === "dateAsc") {
      return new Date(a.create_at || a.createdAt) - new Date(b.create_at || b.createdAt);
    }
    if (sortBy === "amountDesc") {
      return (Number(b.total) || 0) - (Number(a.total) || 0);
    }
    if (sortBy === "amountAsc") {
      return (Number(a.total) || 0) - (Number(b.total) || 0);
    }
    return 0;
  });

  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedSales = filteredSales.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [searchTerm, dateRange, amountRange, sortBy]);

  // Procesar datos para el gráfico de los últimos 7 días
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];
    
    // Agrupar ventas por fecha
    const salesByDate = {};
    sales.forEach(sale => {
      const dateStr = new Date(sale.create_at || sale.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!salesByDate[dateStr]) salesByDate[dateStr] = 0;
      salesByDate[dateStr] += Number(sale.total) || 0;
    });

    // Convertir a array para recharts
    const data = Object.keys(salesByDate).map(date => ({
      name: date,
      Total: salesByDate[date]
    }));

    // Tomamos los 7 días más recientes y los invertimos para mostrar de más antiguo a más nuevo (izquierda a derecha)
    return data.slice(0, 7).reverse();
  }, [sales]);

  const topEventsData = useMemo(() => {
    if (!sales || sales.length === 0) return [];
    const grouped = {};
    sales.forEach(sale => {
      const eventName = sale.Event?.name || `Evento #${sale.event_id || 'Sin nombre'}`;
      if (!grouped[eventName]) grouped[eventName] = 0;
      grouped[eventName] += Number(sale.total) || 0;
    });

    return Object.keys(grouped)
      .map(name => ({ name, value: grouped[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales]);

  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);
  }, [sales]);

  const handleViewDetail = async (saleId) => {
    try {
      setLoadingDetails(true);
      setShowDetailModal(true);
      const res = await saleService.getById(saleId);
      if (res.error) throw new Error(res.error);
      setSelectedSaleDetails(res.data);
    } catch (err) {
      setSelectedSaleDetails(null);
      setShowDetailModal(false);
      toast.error("Error al cargar detalle de la venta");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadSalesPDF();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Historial de Ventas y Facturación
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visualiza el rendimiento financiero y el historial de transacciones.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-border hover:bg-muted/50 transition-all gap-2"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? "Generando..." : "Generar PDF"}
          </Button>
          <Button
            onClick={() => navigate("/sales/create")}
            className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Metrics & Chart Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Total Revenue Card */}
        <Card className="rounded-2xl border-white/10 bg-gradient-to-br from-[#1d3557] to-[#142845] text-white shadow-xl lg:col-span-1 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Banknote className="w-32 h-32" />
          </div>
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="text-lg font-medium text-white/80">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold tracking-tight">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="mt-4 flex items-center text-sm text-green-400">
              <TrendingUp className="mr-1 h-4 w-4" />
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="rounded-2xl border-white/10 bg-card/80 backdrop-blur-md shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Tendencia de Ventas (Últimos movimientos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c05c3c" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#c05c3c" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#c05c3c" floodOpacity="0.4" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)', 
                        backgroundColor: 'var(--card)', 
                        color: 'var(--foreground)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: '#c05c3c', fontWeight: 'bold' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                      labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Total" 
                      stroke="#c05c3c" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)"
                      activeDot={{ r: 6, fill: "var(--background)", stroke: "#c05c3c", strokeWidth: 3 }}
                      style={{ filter: 'url(#shadow)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Insuficientes datos para graficar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Events Chart Card */}
        <Card className="rounded-2xl border-white/10 bg-card/80 backdrop-blur-md shadow-lg lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Top 5 Eventos con Más Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {topEventsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEventsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)', fontWeight: 500 }} width={120} />
                    <Tooltip 
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
                      itemStyle={{ color: '#c05c3c', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {topEventsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#c05c3c" fillOpacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No hay suficientes datos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card className="overflow-hidden rounded-2xl border-white/10 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por evento o # transacción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border-input pl-10 focus:ring-2 focus:ring-[#c05c3c] bg-background/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
              >
                <option value="dateDesc">Más recientes</option>
                <option value="dateAsc">Más antiguos</option>
                <option value="amountDesc">Mayor monto</option>
                <option value="amountAsc">Menor monto</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 rounded-xl border-border transition-all ${showFilters ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'hover:bg-muted/50'}`}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl bg-background/50 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rango de Fechas</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={dateRange.from} 
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="rounded-lg h-9 bg-background/50"
                  />
                  <span className="text-muted-foreground text-sm">a</span>
                  <Input 
                    type="date" 
                    value={dateRange.to} 
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="rounded-lg h-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monto Total ($)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={amountRange.min} 
                    onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                    className="rounded-lg h-9 bg-background/50"
                  />
                  <span className="text-muted-foreground text-sm">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={amountRange.max} 
                    onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                    className="rounded-lg h-9 bg-background/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d3557]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <p className="text-red-500 font-bold mb-1">Error al cargar historial</p>
                <p className="text-sm text-red-500/80">{error}</p>
              </div>
            </div>
          ) : paginatedSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground/50">
              <Receipt className="mx-auto mb-4 h-16 w-16 opacity-20" />
              <p className="text-lg font-medium">No hay ventas registradas</p>
              <p className="text-sm">Las transacciones procesadas en el POS aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="border-b border-border bg-card/80 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Transacción</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Evento / Concepto</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedSales.map((sale) => (
                    <tr
                      key={sale.sale_id}
                      className="transition-all duration-200 hover:bg-muted/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                            <Receipt className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              #{String(sale.sale_id).padStart(5, '0')}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">Pagado</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(sale.create_at || sale.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                          {sale.Event?.name || `Evento #${sale.event_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-lg text-foreground">
                          ${Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(sale.sale_id)}
                          className="rounded-xl hover:bg-[#1d3557]/10 hover:text-[#1d3557] transition-all"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 p-4 border-t border-border/50 bg-card/50">
              <span className="text-sm text-muted-foreground font-medium">
                Página <strong className="text-foreground">{page}</strong> de {totalPages} ({totalItems} total)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={(open) => { if (!open) { setShowDetailModal(false); setSelectedSaleDetails(null); } }}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {selectedSaleDetails ? `Detalle de Venta #${String(selectedSaleDetails.sale_id).padStart(5, '0')}` : 'Cargando...'}
            </DialogTitle>
            <DialogDescription>
              Productos incluidos en esta transacción
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d3557]"></div>
            </div>
          ) : selectedSaleDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 rounded-xl p-4">
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <p className="font-semibold">{new Date(selectedSaleDetails.create_at || selectedSaleDetails.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-semibold text-lg">${Number(selectedSaleDetails.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-muted-foreground">Producto</th>
                      <th className="text-center py-2 font-semibold text-muted-foreground">Cant.</th>
                      <th className="text-right py-2 font-semibold text-muted-foreground">Precio</th>
                      <th className="text-right py-2 font-semibold text-muted-foreground">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(selectedSaleDetails.SaleDetails || selectedSaleDetails.sale_details || []).map((detail, idx) => {
                      const unitPrice = detail.subtotal / detail.quantity;
                      return (
                        <tr key={detail.detail_id || idx}>
                          <td className="py-3 pr-4">
                            <span className="font-medium">{detail.Product?.name || detail.product_name || `Producto #${detail.product_id}`}</span>
                            {detail.Product?.category && <span className="text-xs text-muted-foreground ml-2">({detail.Product.category})</span>}
                          </td>
                          <td className="py-3 text-center font-semibold">{detail.quantity}</td>
                          <td className="py-3 text-right font-semibold">${Number(unitPrice).toFixed(2)}</td>
                          <td className="py-3 text-right font-semibold">${Number(detail.subtotal).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td colSpan="3" className="py-3 text-right font-bold text-base">Total:</td>
                      <td className="py-3 text-right font-bold text-base">${Number(selectedSaleDetails.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No se pudieron cargar los detalles.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
