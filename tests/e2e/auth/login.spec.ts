import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/i)).toBeVisible();
    await expect(page.getByLabel(/パスワード/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /ログイン/i }).click();
    
    // Wait for validation errors
    await expect(page.getByText(/メールアドレスを入力してください/i)).toBeVisible();
    await expect(page.getByText(/パスワードを入力してください/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/メールアドレス/i).fill('invalid-email');
    await page.getByLabel(/パスワード/i).fill('password123');
    await page.getByRole('button', { name: /ログイン/i }).click();
    
    await expect(page.getByText(/有効なメールアドレスを入力してください/i)).toBeVisible();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    await page.getByLabel(/メールアドレス/i).fill('wrong@example.com');
    await page.getByLabel(/パスワード/i).fill('wrongpassword');
    await page.getByRole('button', { name: /ログイン/i }).click();
    
    // Wait for error message
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Use test user credentials
    await page.getByLabel(/メールアドレス/i).fill('test@example.com');
    await page.getByLabel(/パスワード/i).fill('password123');
    await page.getByRole('button', { name: /ログイン/i }).click();
    
    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|articles)/);
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.getByRole('link', { name: /新規登録/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.getByRole('link', { name: /パスワードを忘れた/i }).click();
    await expect(page).toHaveURL('/forgot-password');
  });
});
