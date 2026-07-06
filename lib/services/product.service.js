import { apiClient } from "@/lib/api-client";
export const productService = {
  /**
   * Obtener todos los productos
   */
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.category && filters.category !== "Todas") queryParams.append("category", filters.category);
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.deleted) queryParams.append("deleted", filters.deleted);
    const endpoint = `/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },
  /**
   * Obtener producto por ID
   */
  async getById(id) {
    return apiClient.get(`/products/${id}`);
  },
  /**
   * Crear nuevo producto
   */
  async create(data) {
    return apiClient.post("/products", data);
  },
  /**
   * Actualizar producto
   */
  async update(id, data) {
    return apiClient.put(`/products/${id}`, data);
  },
  /**
   * Eliminar producto
   */
  async delete(id) {
    return apiClient.delete(`/products/${id}`);
  },
  /**
   * Restaurar producto
   */
  async restore(id) {
    return apiClient.put(`/products/${id}/restore`);
  }
};
