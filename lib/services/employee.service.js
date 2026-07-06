import { apiClient } from "@/lib/api-client";
export const employeeService = {
  /**
   * Obtener todos los empleados
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.department) queryParams.append("department", filters.department);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.deleted) queryParams.append("deleted", filters.deleted);
    
    const endpoint = `/employees${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener empleado por ID
   */
  async getById(id) {
    return apiClient.get(`/employees/${id}`);
  },
  /**
   * Crear nuevo empleado
   */
  async create(data) {
    return apiClient.post("/employees", data);
  },
  /**
   * Actualizar empleado
   */
  async update(id, data) {
    return apiClient.put(`/employees/${id}`, data);
  },
  /**
   * Eliminar empleado
   */
  async delete(id) {
    return apiClient.delete(`/employees/${id}`);
  },
  /**
   * Restaurar empleado
   */
  async restore(id) {
    return apiClient.put(`/employees/${id}/restore`);
  },
  /**
   * Obtener cantidad de empleados activos
   */
  async getActiveCount() {
    const response = await this.getAll({ status: "Active" });
    return response.data?.length || 0;
  }
};
