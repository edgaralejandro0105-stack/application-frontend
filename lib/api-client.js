const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
class ApiClient {
  baseUrl;
  isRefreshing = false;
  refreshPromise = null;

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async getAuthToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers();
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (options.headers) {
      const extraHeaders = new Headers(options.headers);
      extraHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
    if (!options.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401 && !options._retry && !options.skipAuth) {
          options._retry = true;
          
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = (async () => {
              try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");
                
                const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken })
                });
                
                if (!refreshResponse.ok) throw new Error("Refresh failed");
                const refreshData = await refreshResponse.json();
                
                if (refreshData.token) {
                  localStorage.setItem("authToken", refreshData.token);
                  if (refreshData.refreshToken) {
                    localStorage.setItem("refreshToken", refreshData.refreshToken);
                  }
                  return refreshData.token;
                }
                throw new Error("No token in refresh response");
              } catch (e) {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("auth:unauthorized"));
                }
                throw e;
              } finally {
                this.isRefreshing = false;
              }
            })();
          }
          
          try {
            await this.refreshPromise;
            // Retry the original request
            return this.request(endpoint, options);
          } catch (e) {
            // Error occurred during refresh, error message will be extracted below
          }
        }

        if (response.status === 401 && options._retry) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth:unauthorized"));
          }
        }

        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      if (options.responseType === 'blob') {
        const data = await response.blob();
        return { data, status: response.status };
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        error: errorMessage,
        status: 500
      };
    }
  }
  // ─── Métodos GET ───
  async get(endpoint, options) {
    return this.request(endpoint, {
      ...options,
      method: "GET"
    });
  }
  // ─── Métodos POST ───
  async post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : void 0)
    });
  }
  // ─── Métodos PUT ───
  async put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : void 0)
    });
  }
  // ─── Métodos DELETE ───
  async delete(endpoint, options) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE"
    });
  }
}
export const apiClient = new ApiClient(API_URL);
export function extractList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}
