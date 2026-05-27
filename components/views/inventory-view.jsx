"use client";
import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  ChevronDown,
  Wine,
  UtensilsCrossed,
  Lamp,
  Armchair,
  History,
  RefreshCw,
  Edit2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productService } from "@/lib/services/product.service";
import { inventorybarService } from "@/lib/services/inventorybar.service";
const categoryIcons = {
  Beverages: Wine,
  Catering: UtensilsCrossed,
  Decoracion: Lamp,
  Furniture: Armchair,
  "Table Linens": Package,
  Glassware: Wine,
  Floral: Package,
  Bar: Wine,
  General: Package
};
export function InventoryView() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState("Entry");
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [movementUnitPrice, setMovementUnitPrice] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Bar");
  const [productUnit, setProductUnit] = useState("Botella");
  const [productExpiry, setProductExpiry] = useState("");
  const [productStock, setProductStock] = useState(0);
  const [productMinStock, setProductMinStock] = useState(0);
  const [productPrice, setProductPrice] = useState("");
  const categories = ["All", "Beverages", "Catering", "Decoracion", "Furniture", "Table Linens", "Glassware", "Floral", "Bar", "General"];
  const formCategories = ["Beverages", "Catering", "Decoracion", "Furniture", "Table Linens", "Glassware", "Floral", "Bar", "General"];
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, movementsRes] = await Promise.all([
        productService.getAll({
          limit: 100,
          search: searchTerm || void 0,
          category: filterCategory === "All" ? void 0 : filterCategory
        }),
        inventorybarService.getAll({ limit: 100 })
      ]);
      if (productsRes.error) {
        throw new Error(productsRes.error);
      }
      if (movementsRes.error) {
        throw new Error(movementsRes.error);
      }
      setProducts(productsRes.data?.data || []);
      setMovements(movementsRes.data?.data || []);
    } catch (err) {
      console.error("Error loading inventory data:", err);
      setError(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };
  const loadProducts = async () => {
    try {
      const res = await productService.getAll({
        limit: 100,
        search: searchTerm || void 0,
        category: filterCategory === "All" ? void 0 : filterCategory
      });
      if (!res.error && res.data) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory]);
  const openAddProductModal = () => {
    setIsEditingProduct(false);
    setSelectedProduct(null);
    setProductName("");
    setProductCategory("Bar");
    setProductUnit("Botella");
    setProductExpiry("");
    setProductStock(0);
    setProductMinStock(0);
    setProductPrice("");
    setProductModalOpen(true);
  };
  const openEditProductModal = (product) => {
    setIsEditingProduct(true);
    setSelectedProduct(product);
    setProductName(product.name || "");
    setProductCategory(product.category || "Bar");
    setProductUnit(product.measurement_unit || "Botella");
    setProductExpiry(product.expiry_date ? product.expiry_date.substring(0, 10) : "");
    setProductStock(product.current_stock || 0);
    setProductMinStock(product.min_stock || 0);
    setProductPrice(product.unit_price || "");
    setProductModalOpen(true);
  };
  const openMovementModal = (product) => {
    setSelectedProduct(product);
    setMovementType("Entry");
    setMovementQuantity(1);
    setMovementUnitPrice("");
    setMovementModalOpen(true);
  };
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !productCategory || !productUnit) {
      alert("Please fill in all required fields.");
      return;
    }
    const payload = {
      name: productName,
      category: productCategory,
      measurement_unit: productUnit,
      expiry_date: productExpiry || void 0,
      min_stock: Number(productMinStock),
      current_stock: Number(productStock),
      unit_price: productPrice ? Number(productPrice) : 0
    };
    try {
      let res;
      if (isEditingProduct && selectedProduct) {
        res = await productService.update(selectedProduct.product_id, payload);
      } else {
        res = await productService.create(payload);
      }
      if (res.error) {
        alert(`Error al guardar el producto: ${res.error}`);
      } else {
        setProductModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (!confirm("\xBFEst\xE1s seguro de que deseas eliminar este producto?")) return;
    try {
      const res = await productService.delete(productId);
      if (res.error) {
        alert(`Error al eliminar el producto: ${res.error}`);
      } else {
        loadData();
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };
  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (movementQuantity <= 0) {
      alert("La cantidad debe ser mayor que 0.");
      return;
    }
    if (movementType === "Exit" && (selectedProduct.current_stock || 0) < movementQuantity) {
      if (!confirm(`El stock actual (${selectedProduct.current_stock}) es menor que la cantidad de salida (${movementQuantity}). \xBFContinuar?`)) {
        return;
      }
    }
    const payload = {
      product_id: selectedProduct.product_id,
      quantity: Number(movementQuantity),
      movement_type: movementType,
      unit_price: movementUnitPrice ? Number(movementUnitPrice) : void 0
    };
    try {
      const res = await inventorybarService.create(payload);
      if (res.error) {
        alert(`Error al registrar el movimiento: ${res.error}`);
      } else {
        setMovementModalOpen(false);
        loadData();
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };
  const lowStockProducts = products.filter((p) => (p.current_stock ?? 0) < (p.min_stock ?? 0));
  if (loading && products.length === 0) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#c05c3c]" />
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>;
  }
  if (error && products.length === 0) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-[#c05c3c]" />
          <p className="text-red-600 mb-2">Error cargando inventario</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
      onClick={loadData}
      className="mt-4"
      variant="outline"
    >
            Reintentar
          </Button>
        </div>
      </div>;
  }
  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {
    /* Header */
  }
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventario y Operaciones
          </h1>
          <p className="mt-1 text-muted-foreground">
            Controla productos, existencias y movimientos.
          </p>
        </div>
        <Button
    onClick={openAddProductModal}
    className="rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
  >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {
    /* Low Stock Alert */
  }
      {lowStockProducts.length > 0 && <Card className="rounded-2xl border-2 border-[#c05c3c]/30 bg-[#c05c3c]/5 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c05c3c]">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#c05c3c]">Alerta de stock bajo</p>
                <p className="text-sm text-muted-foreground">
                  {lowStockProducts.length} productos por debajo del nivel mínimo: {" "}
                  {lowStockProducts.map((p) => p.name).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {
    /* Tabs */
  }
      <div className="flex flex-wrap gap-2 rounded-2xl bg-card/40 p-2 backdrop-blur-md shadow-sm border border-border/50">
        <button
    onClick={() => setActiveTab("catalog")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === "catalog" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
          <Package className="h-4 w-4" />
          Catálogo de productos ({products.length})
        </button>
        <button
    onClick={() => setActiveTab("history")}
    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
  >
          <History className="h-4 w-4" />
          Historial de movimientos ({movements.length})
        </button>
      </div>

      {
    /* Catalog View */
  }
      {activeTab === "catalog" && <>
          {
    /* Search & Filter */
  }
          <Card className="rounded-2xl border border-white/20 bg-card/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
    placeholder="Buscar productos..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="h-9 rounded-lg border-input pl-9 text-sm focus:ring-2 focus:ring-[#c05c3c]"
  />
                </div>
                <div className="relative w-full sm:w-48">
                  <select
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
    className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
  >
                    {categories.map((cat) => <option key={cat} value={cat}>
                        {cat === "All" ? "Todos" : cat}
                      </option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {
    /* Products Table */
  }
          <Card className="mt-4 overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-card/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Producto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Unidad
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Precio
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Stock mínimo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Stock actual
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Caducidad
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.length === 0 ? <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No se encontraron productos
                        </td>
                      </tr> : products.map((product) => {
    const isLowStock = (product.current_stock ?? 0) < (product.min_stock ?? 0);
    const IconComponent = categoryIcons[product.category] || Package;
    return <tr
      key={product.product_id}
      className={`transition-all duration-300 hover:bg-muted/60 hover:shadow-sm ${isLowStock ? "bg-[#c05c3c]/5" : ""}`}
    >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isLowStock ? "bg-[#c05c3c]/10" : "bg-[#1d3557]/10"}`}
    >
                                  <IconComponent
      className={`h-5 w-5 ${isLowStock ? "text-[#c05c3c]" : "text-[#1d3557]"}`}
    />
                                </div>
                                <div>
                                  <p className="flex items-center gap-2 font-semibold text-foreground">
                                    {product.name}
                                    {isLowStock && <span className="rounded-full bg-[#c05c3c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                                        Low Stock
                                      </span>}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-muted-foreground">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-full bg-secondary/50 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                {product.measurement_unit}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#6b705c]">
                              ${Number(product.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {product.min_stock}
                            </td>
                            <td className="px-6 py-4">
                              <p
      className={`text-base font-bold ${isLowStock ? "text-[#c05c3c]" : "text-[#6b705c]"}`}
    >
                                {product.current_stock ?? 0}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "No vence"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
      onClick={() => openMovementModal(product)}
      variant="outline"
      size="sm"
      className="rounded-xl border-[#6b705c] text-[#6b705c] hover:bg-[#6b705c]/10 transition-all"
    >
                                  Movimiento
                                </Button>
                                <Button
      onClick={() => openEditProductModal(product)}
      variant="outline"
      size="sm"
      className="rounded-xl border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557]/10 transition-all"
    >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
      onClick={() => handleDeleteProduct(product.product_id)}
      variant="outline"
      size="sm"
      className="rounded-xl border-red-500 text-red-500 hover:bg-red-500/10 transition-all"
    >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>;
  })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>}

      {
    /* History View */
  }
      {activeTab === "history" && <Card className="overflow-hidden rounded-2xl border border-white/20 bg-card/80 backdrop-blur-md shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <History className="h-5 w-5 text-[#c05c3c]" />
              Historial de movimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-card/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movements.length === 0 ? <tr>
                      <td colSpan={6} className="px-6 py-8">
                        <div className="text-center text-muted-foreground">
                          <p className="text-sm">No se registraron movimientos</p>
                        </div>
                      </td>
                    </tr> : movements.map((movement) => {
    const product = products.find((p) => p.product_id === movement.product_id);
    const productName2 = product ? product.name : `Producto ID: ${movement.product_id}`;
    const unitName = product ? product.measurement_unit : "";
    let movementLabel = "Ajuste";
    let badgeBg = "bg-[#d4a574]";
    if (movement.movement_type === "Entry") {
      movementLabel = "Entrada";
      badgeBg = "bg-[#6b705c]";
    } else if (movement.movement_type === "Exit") {
      movementLabel = "Salida";
      badgeBg = "bg-[#c05c3c]";
    }
    return <tr key={movement.inventory_id} className="transition-all duration-300 hover:bg-muted/60 hover:shadow-sm">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${badgeBg}`}>
                              {movementLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">
                            {productName2}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">
                            {movement.quantity} {unitName}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {movement.unit_price ? `$${Number(movement.unit_price).toFixed(2)}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {movement.date ? new Date(movement.date).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {movement.user_id ? `ID: ${movement.user_id}` : "Sistema"}
                          </td>
                        </tr>;
  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>}
      </div>

      {
    /* Movement Modal */
  }
      {movementModalOpen && selectedProduct && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 shadow-2xl p-6 bg-card max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  Registrar Movimiento
                </CardTitle>
                <Button
    variant="ghost"
    size="sm"
    onClick={() => setMovementModalOpen(false)}
    className="h-8 w-8 p-0 rounded-full hover:bg-muted"
  >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Producto</Label>
                <Input
    value={selectedProduct.name}
    disabled
    className="mt-1 bg-muted rounded-xl cursor-not-allowed"
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Tipo de Movimiento</Label>
                <div className="relative mt-1">
                  <select
    value={movementType}
    onChange={(e) => setMovementType(e.target.value)}
    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
  >
                    <option value="Entry">Entrada (Compra/Reabastecimiento)</option>
                    <option value="Exit">Salida (Consumo/Venta)</option>
                    <option value="Adjustment">Ajuste de inventario</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Cantidad ({selectedProduct.measurement_unit})</Label>
                <Input
    type="number"
    min="1"
    step="any"
    value={movementQuantity}
    onChange={(e) => setMovementQuantity(Number(e.target.value))}
    className="mt-1 rounded-xl"
    required
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Precio unitario (Opcional)</Label>
                <Input
    type="number"
    min="0"
    step="0.01"
    placeholder="0.00"
    value={movementUnitPrice}
    onChange={(e) => setMovementUnitPrice(e.target.value)}
    className="mt-1 rounded-xl"
  />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
    type="button"
    variant="outline"
    onClick={() => setMovementModalOpen(false)}
    className="flex-1 rounded-xl border-border text-foreground"
  >
                  Cancelar
                </Button>
                <Button
    type="submit"
    className="flex-1 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
  >
                  Guardar movimiento
                </Button>
              </div>
            </form>
          </Card>
        </div>}

      {
    /* Product Modal */
  }
      {productModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border border-white/20 shadow-2xl p-6 bg-card max-h-[95vh] overflow-y-auto">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  {isEditingProduct ? "Editar producto" : "Agregar producto"}
                </CardTitle>
                <Button
    variant="ghost"
    size="sm"
    onClick={() => setProductModalOpen(false)}
    className="h-8 w-8 p-0 rounded-full hover:bg-muted"
  >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Nombre del producto *</Label>
                <Input
    placeholder="p.ej. Ron añejo"
    value={productName}
    onChange={(e) => setProductName(e.target.value)}
    className="mt-1 rounded-xl"
    required
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Categoría *</Label>
                <div className="relative mt-1">
                  <select
    value={productCategory}
    onChange={(e) => setProductCategory(e.target.value)}
    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#c05c3c]"
  >
                    {formCategories.map((cat) => <option key={cat} value={cat}>
                        {cat}
                      </option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Unidad de medida *</Label>
                <Input
    placeholder="Ej. Botella, Unidad, Litro"
    value={productUnit}
    onChange={(e) => setProductUnit(e.target.value)}
    className="mt-1 rounded-xl"
    required
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Fecha de caducidad (Opcional)</Label>
                <Input
    type="date"
    value={productExpiry}
    onChange={(e) => setProductExpiry(e.target.value)}
    className="mt-1 rounded-xl"
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Stock mínimo</Label>
                <Input
    type="number"
    min="0"
    value={productMinStock}
    onChange={(e) => setProductMinStock(Number(e.target.value))}
    className="mt-1 rounded-xl"
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  {isEditingProduct ? "Stock actual" : "Stock inicial"}
                </Label>
                <Input
    type="number"
    min="0"
    value={productStock}
    onChange={(e) => setProductStock(Number(e.target.value))}
    className="mt-1 rounded-xl"
  />
              </div>

              <div>
                <Label className="text-sm font-semibold">Precio unitario ($)</Label>
                <Input
    type="number"
    step="0.01"
    min="0"
    value={productPrice}
    onChange={(e) => setProductPrice(e.target.value)}
    className="mt-1 rounded-xl"
    placeholder="0.00"
  />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
    type="button"
    variant="outline"
    onClick={() => setProductModalOpen(false)}
    className="flex-1 rounded-xl border-border text-foreground"
  >
                  Cancelar
                </Button>
                <Button
    type="submit"
    className="flex-1 rounded-xl bg-[#c05c3c] text-white shadow-lg shadow-[#c05c3c]/30 hover:bg-[#a84d32] transition-all duration-300 hover:-translate-y-1 hover:shadow-[#c05c3c]/50"
  >
                  {isEditingProduct ? "Guardar cambios" : "Crear producto"}
                </Button>
              </div>
            </form>
          </Card>
        </div>}
    </>
  );
}
