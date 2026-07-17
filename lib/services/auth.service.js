import { apiClient } from "@/lib/api-client";
export const authService = {
  /**
   * register: Registra un nuevo usuario en el sistema
   * 
   * Flujo:
   * 1. Enviar credenciales al backend (/auth/register)
   * 2. Recibir token y refreshToken
   * 3. Guardar tokens en localStorage (para persistencia)
   * 4. Retornar respuesta del servidor
   * 
   * @param credentials - Datos de registro del usuario
   * @returns Respuesta del servidor con token y datos del usuario
   */
  async register(credentials) {
    const response = await apiClient.post("/auth/register", credentials, {
      skipAuth: true
      // No necesitamos token para registrarse
    });
    if (response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response;
  },
  /**
   * login: Inicia sesión con email y contraseña
   * 
   * Flujo:
   * 1. Enviar credenciales al backend (/auth/login)
   * 2. Recibir token y refreshToken
   * 3. Guardar en localStorage para persistencia entre sesiones
   * 4. El contexto (AuthContext) completará los datos del usuario
   * 
   * @param credentials - Email y contraseña del usuario
   * @returns Respuesta con token y datos del usuario
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials, {
      skipAuth: true
      // No necesitamos token para hacer login
    });
    if (response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response;
  },
  /**
   * getProfile: Obtiene el perfil del usuario actualmente autenticado
   * 
   * Este endpoint requiere autenticación (usa el token guardado)
   * Se utiliza para obtener datos completos del usuario después de login
   * 
   * @returns Datos del perfil del usuario autenticado
   */
  async getProfile() {
    return apiClient.get("/auth/profile");
  },
  /**
   * refreshToken: Refresca el JWT usando el refreshToken
   * 
   * Flujo de tokens JWT:
   * 1. Token JWT tiene vida útil corta (ej: 1 hora)
   * 2. Cuando expira, usamos refreshToken para obtener uno nuevo
   * 3. RefreshToken tiene vida útil larga (ej: 30 días)
   * 4. Esta función se ejecuta automáticamente antes de que expire
   * 
   * @returns Nueva respuesta con token actualizado
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await apiClient.post(
      "/auth/refresh-token",
      { refreshToken },
      { skipAuth: true }
      // El refreshToken se envía en el body, no en header
    );
    if (response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response;
  },
  /**
   * logout: Cierra la sesión del usuario
   * 
   * Flujo de logout:
   * 1. Intentar notificar al backend (/auth/logout)
   *    - El backend invalida el token en su lista negra (si la tiene)
   *    - O simplemente registra el logout
   * 2. INCLUSO SI FALLA el backend, continuamos:
   *    - Eliminamos tokens del localStorage
   *    - El frontend quedará desautenticado
   * 3. El usuario será redirigido a /login
   * 
   * VENTAJA: El usuario siempre puede hacer logout, aunque el servidor esté caído
   */
  async logout() {
    try {
      await apiClient.post("/auth/logout", {}, { skipAuth: false });
    } catch (error) {
      console.error("Error al cerrar sesi\xF3n en backend:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
    }
  },
  /**
   * forgotPassword: Inicia el proceso de recuperación de contraseña
   * 
   * Flujo:
   * 1. Usuario envía su email
   * 2. Backend genera un token de recuperación
   * 3. Backend envía email con link para resetear contraseña
   * 4. Usuario hace click en el link y cambia su contraseña
   * 
   * @param email - Email del usuario que quiere recuperar acceso
   * @returns Respuesta del servidor (generalmente confirmación)
   */
  async forgotPassword(email) {
    return apiClient.post(
      "/auth/forgot-password",
      { email },
      { skipAuth: true }
      // No necesitamos autenticación para recuperar contraseña
    );
  },
  /**
   * generateResetToken: Valida el email y genera un token de recuperación
   * 
   * DIFERENCIA con forgotPassword:
   * - forgotPassword: Backend valida + genera token + ENVÍA el email
   * - generateResetToken: Backend solo valida + genera token y DEVUELVE los datos
   *                       al frontend para que éste envíe el email vía EmailJS
   * 
   * Flujo:
   * 1. Usuario envía su email
   * 2. Backend verifica que el email existe
   * 3. Backend genera token de recuperación y lo guarda
   * 4. Backend devuelve { token, nombre_usuario } al frontend
   * 5. Frontend envía el email usando EmailJS
   * 
   * @param email - Email del usuario
   * @returns { data: { token, nombre_usuario } }
   */
  async generateResetToken(email) {
    return apiClient.post(
      "/auth/generate-reset-token",
      { email },
      { skipAuth: true }
    );
  },
  /**
   * resetPassword: Crea una nueva contraseña usando un token
   * 
   * @param token - Token de recuperación recibido por email
   * @param newPassword - La nueva contraseña del usuario
   * @returns Respuesta del servidor
   */
  async resetPassword({ token, newPassword }) {
    return apiClient.post(
      "/auth/reset-password",
      { token, newPassword },
      { skipAuth: true }
    );
  },
  /**
   * getStoredToken: Obtiene el token JWT guardado en localStorage
   * 
   * USO: Verificar si hay un token disponible sin hacer petición al servidor
   * SSR CHECK: Retorna null en el servidor (nextjs ssr), solo funciona en cliente
   * 
   * @returns Token JWT o null si no existe
   */
  getStoredToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },
  /**
   * isAuthenticated: Verifica si el usuario está actualmente autenticado
   * 
   * USO: Verificación rápida sin conectar al servidor
   * LIMITACIÓN: Solo verifica que el token exista, no valida su validez
   *             Para validación real, usar getProfile() que conecta al servidor
   * 
   * @returns true si hay un token guardado, false en caso contrario
   */
  isAuthenticated() {
    return this.getStoredToken() !== null;
  }
};
