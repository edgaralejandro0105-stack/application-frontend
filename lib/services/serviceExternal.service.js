import { apiClient, extractList } from "@/lib/api-client";

export const serviceExternalService = {
  /**
   * Obtener todos los servicios externos
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.deleted) queryParams.append("deleted", filters.deleted);
    
    const endpoint = `/service-external${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },

  /**
   * Obtener un servicio por ID
   */
  async getById(id) {
    return apiClient.get(`/service-external/${id}`);
  },

  /**
   * Crear nuevo servicio
   */
  async create(data) {
    return apiClient.post("/service-external", data);
  },

  /**
   * Actualizar servicio
   */
  async update(id, data) {
    return apiClient.put(`/service-external/${id}`, data);
  },

  /**
   * Eliminar servicio
   */
  async delete(id) {
    return apiClient.delete(`/service-external/${id}`);
  },

  /**
   * Restaurar servicio
   */
  async restore(id) {
    return apiClient.put(`/service-external/${id}/restore`);
  }
};
