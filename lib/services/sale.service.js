import { apiClient, extractList } from "@/lib/api-client";
export const saleService = {
  /**
   * Obtener todas las ventas
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
    }
    const endpoint = `/sales${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener venta por ID
   */
  async getById(id) {
    return apiClient.get(`/sales/${id}`);
  },
  /**
   * Crear nueva venta
   */
  async create(data) {
    return apiClient.post("/sales", data);
  },
  /**
   * Actualizar venta
   */
  async update(id, data) {
    return apiClient.put(`/sales/${id}`, data);
  },
  /**
   * Eliminar venta
   */
  async delete(id) {
    return apiClient.delete(`/sales/${id}`);
  },
  /**
   * Obtener ventas recientes
   */
  async getRecent(limit = 5) {
    const response = await this.getAll();
    const list = extractList(response.data);
    return { data: list.slice(0, limit) };
  },
  /**
   * Calcular ingresos totales
   */
  async getTotalRevenue() {
    const response = await this.getAll();
    const list = extractList(response.data);
    return list.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0);
  }
};
