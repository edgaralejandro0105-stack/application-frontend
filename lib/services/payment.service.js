import { apiClient } from "@/lib/api-client";

export const paymentService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.method) query.set("method", params.method);
    if (params.simulated !== undefined) query.set("simulated", params.simulated);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();
    return apiClient.get(`/payments${qs ? `?${qs}` : ""}`);
  },

  async getById(id) {
    return apiClient.get(`/payments/${id}`);
  }
};
