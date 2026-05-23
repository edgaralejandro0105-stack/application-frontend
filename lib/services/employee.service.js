import { apiClient } from "@/lib/api-client";
export const employeeService = {
  /**
   * Obtener todos los empleados
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.department) queryParams.append("department", filters.department);
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
   * Obtener cantidad de empleados activos
   */
  async getActiveCount() {
    const response = await this.getAll({ status: "Active" });
    return response.data?.length || 0;
  }
};
