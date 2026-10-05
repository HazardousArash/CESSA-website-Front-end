const { test, expect } = require('@playwright/test');

test.describe('CESSA Full E2E User Journey', () => {
  
  test('User Registration, Login, and Dashboard Access', async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}@iut.ac.ir`;
    
    // 1. Visit Homepage
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/CESSA/);
    
    // 2. Navigate to Register
    await page.click('text=ثبت نام');
    await expect(page).toHaveURL(/.*register/);
    
    // 3. Fill Registration Form
    await page.fill('input[placeholder="آرش"]', 'E2E');
    await page.fill('input[placeholder="حسینی"]', 'Tester');
    await page.fill('input[placeholder="student@iut.ac.ir"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', 'TestPass123!');
    
    // Submit
    await page.click('button:has-text("ثبت نام")');
    
    // Check successful verification redirect or message (assuming backend auto-verifies or handles test emails)
    // For this test, we assume the user navigates to login to test the login form
    await page.goto('http://localhost:3000/login');
    
    // 4. Login
    await page.click('button:has-text("دانشجو")'); // Select Role
    await page.fill('input[placeholder="user@iut.ac.ir"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', 'TestPass123!');
    await page.click('button:has-text("ورود")');
    
    // 5. Verify Dashboard Loaded
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=پنل کاربری و داشبورد مدیریتی')).toBeVisible();
    await expect(page.locator('text=STUDENT')).toBeVisible();
  });

  test('Public Feed Exploration & Authentication Guards', async ({ page }) => {
    // Navigate to Explore without logging in
    await page.goto('http://localhost:3000/explore');
    
    // Verify the lock screen is visible because they aren't authenticated
    await expect(page.locator('text=دسترسی به شبکه نیازمند احراز هویت است')).toBeVisible();
    
    // Ensure the protected elements are NOT visible
    await expect(page.locator('text=FEED EXPLORER')).toBeHidden();
  });

  test('Navbar Responsive Navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Click About
    await page.click('text=درباره ما');
    await expect(page).toHaveURL(/.*about/);
    await expect(page.locator('text=توسعه نرم‌افزار')).toBeVisible();

    // Click Hall of Fame
    await page.click('text=تالار مفاخر');
    await expect(page).toHaveURL(/.*hall-of-fame/);
    await expect(page.locator('text=The Elite Nodes')).toBeVisible();
  });
});