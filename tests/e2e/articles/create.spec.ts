import { test, expect } from '@playwright/test';

test.describe('Article Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('test@example.com');
    await page.getByLabel(/パスワード/i).fill('password123');
    await page.getByRole('button', { name: /ログイン/i }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/(dashboard|articles)/);
    
    // Navigate to create article page
    await page.goto('/articles/new');
  });

  test('should display article creation form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /新規記事作成/i })).toBeVisible();
    await expect(page.getByLabel(/タイトル/i)).toBeVisible();
    await expect(page.getByLabel(/内容/i)).toBeVisible();
    await expect(page.getByLabel(/カテゴリ/i)).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.getByRole('button', { name: /下書き保存|公開/i }).first().click();
    
    await expect(page.getByText(/タイトルを入力してください/i)).toBeVisible();
    await expect(page.getByText(/内容を入力してください/i)).toBeVisible();
  });

  test('should create draft article successfully', async ({ page }) => {
    await page.getByLabel(/タイトル/i).fill('Test Article Title');
    await page.getByLabel(/内容/i).fill('This is test article content.');
    await page.getByLabel(/抜粋/i).fill('Test excerpt');
    
    // Select category
    await page.getByLabel(/カテゴリ/i).click();
    await page.getByRole('option').first().click();
    
    // Save as draft
    await page.getByRole('button', { name: /下書き保存/i }).click();
    
    // Should show success message
    await expect(page.getByText(/記事を下書き保存しました/i)).toBeVisible();
    
    // Should redirect to article list or edit page
    await page.waitForURL(/\/articles/);
  });

  test('should publish article successfully', async ({ page }) => {
    await page.getByLabel(/タイトル/i).fill('Published Article');
    await page.getByLabel(/内容/i).fill('This article will be published.');
    await page.getByLabel(/抜粋/i).fill('Published excerpt');
    
    // Select category
    await page.getByLabel(/カテゴリ/i).click();
    await page.getByRole('option').first().click();
    
    // Publish
    await page.getByRole('button', { name: /公開/i }).click();
    
    // Should show success message
    await expect(page.getByText(/記事を公開しました/i)).toBeVisible();
  });

  test('should upload thumbnail image', async ({ page }) => {
    // Create a test image file
    const buffer = Buffer.from('fake-image-data');
    
    await page.getByLabel(/タイトル/i).fill('Article with Image');
    await page.getByLabel(/内容/i).fill('Article content');
    
    // Upload thumbnail
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer,
    });
    
    // Wait for upload to complete
    await expect(page.getByAltText(/サムネイル/i)).toBeVisible();
  });

  test('should add tags to article', async ({ page }) => {
    await page.getByLabel(/タイトル/i).fill('Article with Tags');
    await page.getByLabel(/内容/i).fill('Article content');
    
    // Add tags
    const tagInput = page.getByPlaceholder(/タグを追加/i);
    await tagInput.fill('JavaScript');
    await page.keyboard.press('Enter');
    
    await tagInput.fill('Next.js');
    await page.keyboard.press('Enter');
    
    // Verify tags are added
    await expect(page.getByText('JavaScript')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
  });

  test('should preview article before publishing', async ({ page }) => {
    await page.getByLabel(/タイトル/i).fill('Preview Test Article');
    await page.getByLabel(/内容/i).fill('# Heading\n\nThis is **bold** text.');
    
    // Click preview button
    await page.getByRole('button', { name: /プレビュー/i }).click();
    
    // Verify preview modal or page
    await expect(page.getByRole('heading', { name: 'Preview Test Article' })).toBeVisible();
    await expect(page.getByText('This is')).toBeVisible();
    await expect(page.locator('strong').getByText('bold')).toBeVisible();
  });
});
