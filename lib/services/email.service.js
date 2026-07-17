import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const emailService = {
  async sendPasswordResetEmail({ user_email, nombre_usuario, enlace_recuperacion, title = 'Recuperación de Contraseña' }) {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      { user_email, nombre_usuario, enlace_recuperacion, title },
      PUBLIC_KEY
    );
    return response;
  },
};
