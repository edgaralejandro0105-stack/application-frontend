import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('debe mostrar el formulario de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill('test@test.com');
    await page.getByLabel(/contraseña/i).fill('wrong');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page.getByText(/error/i)).toBeVisible();
  });
});
