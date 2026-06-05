import { apiClient } from "@/lib/api-client";
export const clientService = {
  /**
   * Obtener todos los clientes
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'All') queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    
    const endpoint = `/clients${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener cliente por ID
   */
  async getById(id) {
    return apiClient.get(`/clients/${id}`);
  },
  /**
   * Crear nuevo cliente
   */
  async create(data) {
    return apiClient.post("/clients", data);
  },
  /**
   * Actualizar cliente
   */
  async update(id, data) {
    return apiClient.put(`/clients/${id}`, data);
  },
  /**
   * Eliminar cliente
   */
  async delete(id) {
    return apiClient.delete(`/clients/${id}`);
  },
  /**
   * Obtener cantidad de clientes activos
   */
  async getActiveCount() {
    const response = await this.getAll({ status: "Active" });
    return response.data?.length || 0;
  }
};
