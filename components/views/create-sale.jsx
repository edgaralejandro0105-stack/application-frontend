"use client";
import { useState, useEffect, useRef } from "react";
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
  const lastPrintData = useRef(null);

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
  const watchEventId = watch("event_id");
  const watchPaymentMethod = watch("payment_method");
  const watchReference = watch("reference");

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
      
      lastPrintData.current = {
        items: [...ticketItems],
        discount: Number(watchDiscount) || 0,
        paymentMethod: watchPaymentMethod,
        reference: watchReference,
        eventId: watchEventId,
        events: events,
        user: user,
      };

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
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
      
      {/* Header - Hides on print */}
      <div className="flex items-center justify-between gap-4">
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
      <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Left Side: Catalog - Hides on print */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
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
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-20 w-20 rounded-xl object-cover border border-white/10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${product.image_url ? 'hidden' : ''} fallback-icon flex h-20 w-20 items-center justify-center rounded-xl bg-[#1d3557]/10 border border-[#1d3557]/20`}>
                        <ShoppingCart className="h-8 w-8 text-[#1d3557]" />
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
        <div className="lg:col-span-5 h-full">
          <Card className="flex flex-col h-full rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-2xl">
            
            <CardHeader className="border-b border-border/50 pb-4">
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
            
            <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {ticketItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                  <p>El ticket está vacío</p>
                </div>
              ) : (
                <div className="space-y-3 print:space-y-1">
                  {ticketItems.map(item => (
                    <div key={item.product_id} className="flex flex-col gap-2 rounded-xl bg-background/50 p-3 border border-border/50">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm line-clamp-1">{item.name}</span>
                        <button 
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
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
                        
                        <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-4 border-t border-border/50 p-4 bg-muted/10">
              
              {/* Resumen */}
              <div className="w-full space-y-2">
                <div className="flex justify-between w-full items-center text-sm text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(watchDiscount) > 0 && (
                  <div className="flex justify-between w-full items-center text-sm text-green-500 font-medium">
                    <span>Descuento:</span>
                    <span>-${Number(watchDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between w-full items-center pt-2 border-t border-border/50">
                  <span className="text-muted-foreground font-bold">TOTAL:</span>
                  <span className="text-3xl font-bold text-foreground">
                    ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 mt-2">
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

            </CardFooter>
          </Card>
        </div>
      </div>
      </div>

      <style>{`@media print { [data-sonner-toaster] { display: none !important; } }`}</style>

      {/* DEDICATED PRINT RECEIPT UI */}
      {(() => {
        const printSrc = ticketItems.length > 0
          ? {
              items: ticketItems,
              discount: Number(watchDiscount) || 0,
              paymentMethod: watchPaymentMethod,
              reference: watchReference,
              eventId: watchEventId,
              events: events,
              userName: user?.first_name || "Cajero",
              userLastName: user?.last_name || "",
            }
          : lastPrintData.current;

        if (!printSrc || !printSrc.items) return null;

        const printItems = printSrc.items;
        const printDiscount = printSrc.discount;
        const printPaymentMethod = printSrc.paymentMethod;
        const printReference = printSrc.reference;
        const printEventId = printSrc.eventId;
        const printEvents = printSrc.events;
        const printUserName = printSrc.userName;
        const printUserLastName = printSrc.userLastName;

        const printSubtotal = printItems.reduce((t, item) => t + (item.quantity * item.unit_price), 0);
        const printTotal = Math.max(0, printSubtotal - printDiscount);

        const getClientName = () => {
          if (!printEventId) return "Consumidor Final";
          const ev = (printEvents || []).find(e => String(e.event_id || e.id) === printEventId);
          if (!ev) return "Consumidor Final";
          const clientName = ev.Client ? `${ev.Client.first_name || ''} ${ev.Client.last_name || ''}`.trim() : 'Cliente';
          const date = ev.start_date ? new Date(ev.start_date).toLocaleDateString() : '';
          const fallbackName = `${ev.type_event || 'Evento'} - ${clientName} ${date ? `(${date})` : ''}`.trim();
          return ev.title || ev.name || fallbackName;
        };

        return (
        <div className="hidden print:block w-[80mm] mx-auto bg-white p-4 font-mono text-sm" style={{ color: '#000000' }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#000000' }}>LA CASONA</h1>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#000000' }}>Event Agency</p>
            <p className="text-xs" style={{ color: '#000000' }}>RIF: J-9246907-3</p>
            <p className="text-xs" style={{ color: '#000000' }}>Capacho Nuevo, El Ñampo</p>
            <p className="text-xs" style={{ color: '#000000' }}>Tel: +58 414-3768876</p>
            <div className="border-b border-dashed border-black my-4"></div>
            <p className="text-sm font-bold" style={{ color: '#000000' }}>TICKET DE COMPRA</p>
            <p className="text-xs" style={{ color: '#000000' }}>{new Date().toLocaleString()}</p>
          </div>

          <div className="mb-4 text-xs space-y-1">
            <p style={{ color: '#000000' }}><span className="font-bold">Cliente:</span> {getClientName()}</p>
            <p style={{ color: '#000000' }}><span className="font-bold">Atendido por:</span> {printUserName} {printUserLastName}</p>
          </div>

          <div className="border-b border-dashed border-black mb-2"></div>
          
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="text-left font-bold border-b border-black" style={{ color: '#000000' }}>
                <th className="pb-1 w-12 text-center">CANT</th>
                <th className="pb-1 pl-2">DESCRIPCIÓN</th>
                <th className="pb-1 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20">
              {printItems.map((item, idx) => (
                <tr key={item.product_id || idx} className="align-top" style={{ color: '#000000' }}>
                  <td className="py-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-2 px-2">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px]">${Number(item.unit_price).toFixed(2)} c/u</div>
                  </td>
                  <td className="py-2 text-right font-bold">${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-black pt-3 mb-4 space-y-1">
            <div className="flex justify-between text-xs" style={{ color: '#000000' }}>
              <span>Subtotal:</span>
              <span>${printSubtotal.toFixed(2)}</span>
            </div>
            {printDiscount > 0 && (
              <div className="flex justify-between text-xs font-bold" style={{ color: '#000000' }}>
                <span>Descuento:</span>
                <span>-${printDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-black" style={{ color: '#000000' }}>
              <span>TOTAL:</span>
              <span>${printTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs space-y-1 mb-6 p-2 rounded-lg border border-black">
            <p style={{ color: '#000000' }}><span className="font-bold">Método de Pago:</span> {printPaymentMethod || "Efectivo"}</p>
            {printReference && <p style={{ color: '#000000' }}><span className="font-bold">Ref:</span> {printReference}</p>}
          </div>

          <div className="text-center text-xs mt-8 space-y-1">
            <p className="font-bold uppercase text-sm" style={{ color: '#000000' }}>¡Gracias por su compra!</p>
            <p style={{ color: '#000000' }}>Documento sin validez fiscal</p>
            <p className="mt-2 text-[10px]" style={{ color: '#000000' }}>Sistema La Casona ERP</p>
          </div>
        </div>
        );
      })()}
    </>
  );
}
