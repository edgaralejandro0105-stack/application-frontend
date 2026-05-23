import { apiClient } from "@/lib/api-client";
export const dashboardService = {
  /**
   * Obtener todos los datos del dashboard
   */
  async getDashboardData() {
    return apiClient.get("/dashboard");
  },
  /**
   * Obtener estadísticas
   */
  async getStats() {
    const response = await apiClient.get("/dashboard/stats");
    return response;
  }
};
