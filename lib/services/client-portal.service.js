import { apiClient, extractList } from "@/lib/api-client";

function getClientHeaders() {
  const token = localStorage.getItem("clientToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const clientPortalService = {
  async login(email, password) {
    const res = await apiClient.post("/clients/login", { email, password }, { skipAuth: true });
    if (res.error) return res;
    const data = res.data?.data || res.data;
    return { data, error: null };
  },

  async getProfile() {
    return apiClient.get("/clients/me", { headers: getClientHeaders() });
  },

  async getEvents() {
    const res = await apiClient.get("/clients/me/events", { headers: getClientHeaders() });
    if (res.error) return res;
    return { data: extractList(res.data), error: null };
  },

  async getEventDetail(eventId) {
    return apiClient.get(`/clients/me/events/${eventId}`, { headers: getClientHeaders() });
  },

  async getPayments() {
    const res = await apiClient.get("/clients/me/payments", { headers: getClientHeaders() });
    if (res.error) return res;
    return { data: extractList(res.data), error: null };
  },

  async getPaymentDetail(paymentId) {
    return apiClient.get(`/clients/me/payments/${paymentId}`, { headers: getClientHeaders() });
  },

  async submitRating(eventId, data) {
    return apiClient.post(`/clients/me/events/${eventId}/rating`, data, { headers: getClientHeaders() });
  },

  async downloadInvoice(paymentId) {
    return apiClient.get(`/clients/me/payments/${paymentId}/invoice`, {
      headers: getClientHeaders(),
      responseType: 'blob'
    });
  },
};
