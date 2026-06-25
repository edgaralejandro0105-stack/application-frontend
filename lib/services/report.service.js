import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export const reportService = {
  /**
   * Helper function to download a file from the backend
   */
  async downloadFile(endpoint, filename) {
    try {
      const response = await apiClient.get(endpoint, {
        responseType: 'blob'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a small delay to ensure download has started
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 500);
      
      toast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Error al descargar el reporte");
    }
  },

  downloadInventoryPDF() {
    return this.downloadFile('/reports/inventory/pdf', 'inventario.pdf');
  },

  downloadClientsPDF() {
    return this.downloadFile('/reports/clients/pdf', 'clientes.pdf');
  },

  downloadProvidersPDF() {
    return this.downloadFile('/reports/providers/pdf', 'proveedores.pdf');
  },

  downloadSalesPDF() {
    return this.downloadFile('/reports/sales/pdf', 'ventas.pdf');
  },

  downloadEmployeesPDF() {
    return this.downloadFile('/reports/employees/pdf', 'empleados.pdf');
  }
};
