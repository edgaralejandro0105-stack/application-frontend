import { apiClient } from "@/lib/api-client";
export const inventorybarService = {
  /**
   * Obtener todos los movimientos de inventario de barra
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.movement_type) queryParams.append("movement_type", filters.movement_type);
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    const endpoint = `/inventory${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener movimiento de inventario por ID
   */
  async getById(id) {
    return apiClient.get(`/inventory/${id}`);
  },
  /**
   * Registrar nuevo movimiento de inventario
   */
  async create(data) {
    return apiClient.post("/inventory", data);
  },
  /**
   * Actualizar movimiento de inventario
   */
  async update(id, data) {
    return apiClient.put(`/inventory/${id}`, data);
  },
  /**
   * Eliminar registro de movimiento de inventario
   */
  async delete(id) {
    return apiClient.delete(`/inventory/${id}`);
  }
};
