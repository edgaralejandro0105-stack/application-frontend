import { apiClient, extractList } from "@/lib/api-client";
export const eventService = {
  /**
   * Obtener todos los eventos
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    queryParams.append("limit", "1000"); // Asegurar traer todos los eventos para el calendario
    const endpoint = `/events${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener evento por ID
   */
  async getById(id) {
    return apiClient.get(`/events/${id}`);
  },
  /**
   * Crear nuevo evento
   */
  async create(data) {
    return apiClient.post("/events", data);
  },
  /**
   * Actualizar evento
   */
  async update(id, data) {
    return apiClient.put(`/events/${id}`, data);
  },
  /**
   * Eliminar evento
   */
  async delete(id) {
    return apiClient.delete(`/events/${id}`);
  },
  /**
   * Obtener eventos próximos (últimos 5)
   */
  async getUpcoming(limit = 5) {
    const response = await this.getAll();
    const list = extractList(response.data);
    return {
      data: list.filter((e) => e.status !== "Finished" && e.status !== "Cancelled").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, limit)
    };
  }
};
