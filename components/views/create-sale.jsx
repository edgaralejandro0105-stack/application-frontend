"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  ArrowLeft,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productService } from "@/lib/services/product.service";
import { eventService } from "@/lib/services/event.service";
import { saleService } from "@/lib/services/sale.service";
import { extractList } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; 

const saleSchema = z.object({
  event_id: z.string().min(1, "Debe seleccionar un evento asociado"),
  payment_method: z.string().min(1, "Debe seleccionar un método de pago"),
  reference: z.string().optional(),
  discount: z.number().min(0).optional()
});

export function CreateSale({ onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // POS State
  const [ticketItems, setTicketItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      event_id: "",
      payment_method: "Efectivo",
      reference: "",
      discount: 0
    }
  });

  const watchDiscount = watch("discount", 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, eventsRes] = await Promise.all([
          productService.getAll({ limit: 100 }),
          eventService.getAll()
        ]);
        
        if (!productsRes.error) {
          setProducts(productsRes.data?.data || []);
        }
        if (!eventsRes.error) {
          setEvents(extractList(eventsRes.data));
        }
      } catch (err) {
        console.error("Error loading POS data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToTicket = (product) => {
    setTicketItems(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, unit_price: product.unit_price || 0 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setTicketItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  };

  const updatePrice = (productId, price) => {
    setTicketItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, unit_price: Number(price) };
      }
      return item;
    }));
  };

  const removeItem = (productId) => {
    setTicketItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return ticketItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = Number(watchDiscount) || 0;
    return Math.max(0, subtotal - discountAmount);
  };

  const handlePrint = () => {
    window.print();
  };

  const onSubmit = async (data) => {
    if (ticketItems.length === 0) {
      toast.error("El ticket está vacío. Agrega productos antes de cobrar.");
      return;
    }

    setIsProcessing(true);
    const payload = {
      event_id: Number(data.event_id),
      employee_id: user?.id || 1, 
      total: calculateTotal(),
      
      payment_method: data.payment_method,
      reference: data.reference || undefined,
      discount: data.discount || 0,
      details: ticketItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity
      }))
    };

    try {
      const res = await saleService.create(payload);
      if (res.error) throw new Error(res.error);
      
      toast.success("Venta registrada exitosamente", {
        action: {
          label: 'Imprimir Recibo',
          onClick: handlePrint,
        },
      });
      setTicketItems([]);
      reset(); 
    } catch (err) {
      toast.error(`Error procesando venta: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:p-0">
      
      {/* Header - Hides on print */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => onNavigate("sales")}
            className="rounded-xl border-border hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Ventas
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Registrar Venta (POS)
          </h1>
        </div>
      </div>

      {/* POS Layout Split */}
      <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-12rem)] min-h-[600px] print:block print:h-auto">
        
        {/* Left Side: Catalog - Hides on print */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full print:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-white/20 bg-card/60 backdrop-blur-md pl-10 focus:ring-2 focus:ring-[#c05c3c]"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d3557]"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No se encontraron productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.product_id}
                    onClick={() => addToTicket(product)}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-card/60 hover:shadow-lg hover:border-white/20"
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3557]/10 border border-[#1d3557]/20">
                        <ShoppingCart className="h-5 w-5 text-[#1d3557]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex justify-center gap-2">
                          <span>Stock: {product.current_stock ?? 0}</span>
                          <span>•</span>
                          <span className="font-medium text-[#6b705c]">${Number(product.unit_price || 0).toFixed(2)}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ticket & Checkout - Expands on print */}
        <div className="lg:col-span-5 h-full print:w-[80mm] print:mx-auto">
          <Card className="flex flex-col h-full rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
            
            {/* Elemento exclusivo para impresión (Cabecera del Recibo) */}
            <div className="hidden print:block text-center border-b border-dashed border-gray-400 pb-4 mb-4">
              <h2 className="text-2xl font-bold tracking-tight">LA CASONA</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Event Agency</p>
              <p className="text-xs mt-2">Ticket de Compra</p>
              <p className="text-xs">{new Date().toLocaleString()}</p>
            </div>

            <CardHeader className="border-b border-border/50 pb-4 print:hidden">
              <CardTitle className="flex items-center justify-between gap-2 text-xl font-bold">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#c05c3c]" />
                  Ticket
                </div>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="h-8 hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Printer className="h-4 w-4 mr-2" /> Imprimir
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar print:overflow-visible print:p-0">
              {ticketItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50 print:hidden">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                  <p>El ticket está vacío</p>
                </div>
              ) : (
                <div className="space-y-3 print:space-y-1">
                  {ticketItems.map(item => (
                    <div key={item.product_id} className="flex flex-col gap-2 rounded-xl bg-background/50 p-3 border border-border/50 print:border-none print:bg-transparent print:p-1 print:border-b print:border-dashed print:border-gray-200 print:rounded-none">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm line-clamp-1 print:text-black">{item.name}</span>
                        <button 
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors print:hidden"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 print:hidden">
                          <button 
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {/* Texto exclusivo impresión */}
                        <div className="hidden print:block text-sm">
                          {item.quantity}x @ ${item.unit_price}
                        </div>

                        <div className="flex items-center gap-2 print:hidden">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updatePrice(item.product_id, e.target.value)}
                            className="h-8 w-20 text-right font-semibold rounded-lg bg-background"
                          />
                        </div>
                        
                        <div className="hidden print:block font-bold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-4 border-t border-border/50 p-4 bg-muted/10 print:bg-transparent print:border-dashed print:border-gray-400 print:mt-4 print:p-0 print:pt-4">
              
              {/* Resumen */}
              <div className="w-full space-y-2">
                <div className="flex justify-between w-full items-center text-sm text-muted-foreground print:text-black">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(watchDiscount) > 0 && (
                  <div className="flex justify-between w-full items-center text-sm text-green-500 font-medium">
                    <span>Descuento:</span>
                    <span>-${Number(watchDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between w-full items-center pt-2 border-t border-border/50 print:border-dashed print:border-gray-300">
                  <span className="text-muted-foreground font-bold print:text-black">TOTAL:</span>
                  <span className="text-3xl font-bold text-foreground print:text-black print:text-2xl">
                    ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Checkout Form - Hides on print */}
              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 mt-2 print:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evento Asociado</Label>
                    <select 
                      {...register("event_id")}
                      className={`w-full appearance-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c] transition-all ${errors.event_id ? 'border-red-500' : 'border-input'}`}
                    >
                      <option value="">Selecciona un evento...</option>
                      {events.map(ev => {
                        const clientName = ev.Client ? `${ev.Client.first_name || ''} ${ev.Client.last_name || ''}`.trim() : 'Cliente';
                        const date = ev.start_date ? new Date(ev.start_date).toLocaleDateString() : '';
                        const fallbackName = `${ev.type_event || 'Evento'} - ${clientName} ${date ? `(${date})` : ''}`.trim();
                        const eventName = ev.title || ev.name || fallbackName;
                        
                        return (
                          <option key={ev.event_id || ev.id} value={String(ev.event_id || ev.id)}>
                            {eventName}
                          </option>
                        );
                      })}
                    </select>
                    {errors.event_id && <p className="text-xs text-red-500">{errors.event_id.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descuento ($)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      {...register("discount", { valueAsNumber: true })}
                      className="rounded-xl bg-background border-input focus:ring-2 focus:ring-[#c05c3c]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Método</Label>
                    <select 
                      {...register("payment_method")}
                      className={`w-full appearance-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c] ${errors.payment_method ? 'border-red-500' : 'border-input'}`}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Punto de Venta">Punto de Venta</option>
                      <option value="Transferencia">Transfer. / Pago Móvil</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Referencia (Opcional)</Label>
                  <Input 
                    {...register("reference")}
                    placeholder="N° de transacción o detalle"
                    className="rounded-xl bg-background border-input focus:ring-2 focus:ring-[#c05c3c]"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isProcessing || ticketItems.length === 0}
                  className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-[#c05c3c] to-[#a84d32] text-white shadow-lg shadow-[#c05c3c]/30 hover:scale-[1.02] transition-all duration-300"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {isProcessing ? "Procesando..." : "Cobrar Total"}
                </Button>
              </form>
              
              {/* Footer de ticket para impresión */}
              <div className="hidden print:block text-center text-xs mt-6 border-t border-dashed border-gray-400 pt-4">
                <p>¡Gracias por su compra!</p>
                <p className="mt-1 text-gray-500">Documento sin validez fiscal</p>
              </div>

            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
