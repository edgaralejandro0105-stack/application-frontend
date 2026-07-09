import { apiClient } from "@/lib/api-client";

export const providerService = {
  async getAll(filters) {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    const endpoint = `/providers${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return apiClient.get(endpoint);
  },

  async getById(id) {
    return apiClient.get(`/providers/${id}`);
  },

  async create(data) {
    return apiClient.post("/providers", data);
  },

  async update(id, data) {
    return apiClient.put(`/providers/${id}`, data);
  },

  async delete(id) {
    return apiClient.delete(`/providers/${id}`);
  }
};
