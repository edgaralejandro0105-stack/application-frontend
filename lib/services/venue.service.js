import { apiClient } from "@/lib/api-client";
export const venueService = {
  /**
   * Obtener todos los locales
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.city) queryParams.append("city", filters.city);
    const endpoint = `/venues${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener local por ID
   */
  async getById(id) {
    return apiClient.get(`/venues/${id}`);
  },
  /**
   * Crear nuevo local
   */
  async create(data) {
    return apiClient.post("/venues", data);
  },
  /**
   * Actualizar local
   */
  async update(id, data) {
    return apiClient.put(`/venues/${id}`, data);
  },
  /**
   * Eliminar local
   */
  async delete(id) {
    return apiClient.delete(`/venues/${id}`);
  }
};
