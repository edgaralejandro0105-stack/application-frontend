import { apiClient } from "@/lib/api-client";
export const inventoryService = {
  /**
   * Obtener todos los items del inventario
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
    const endpoint = `/inventory${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener item por ID
   */
  async getById(id) {
    return apiClient.get(`/inventory/${id}`);
  },
  /**
   * Crear nuevo item
   */
  async create(data) {
    return apiClient.post("/inventory", data);
  },
  /**
   * Actualizar item
   */
  async update(id, data) {
    return apiClient.put(`/inventory/${id}`, data);
  },
  /**
   * Eliminar item
   */
  async delete(id) {
    return apiClient.delete(`/inventory/${id}`);
  },
  /**
   * Obtener items con stock bajo
   */
  async getLowStockItems() {
    const response = await this.getAll({ lowStock: true });
    return response;
  },
  /**
   * Obtener cantidad de alertas de stock bajo
   */
  async getLowStockCount() {
    const response = await this.getLowStockItems();
    return response.data?.length || 0;
  }
};
