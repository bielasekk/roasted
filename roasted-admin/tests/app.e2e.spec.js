import { test, expect } from '@playwright/test';

const mockReports = [
  {
    id: 1,
    text: 'Abusive comment',
    reporter: 'User1',
    abusive_author: 'Troll123',
    url: 'http://example.com/1',
    timestamp: '2025-09-01T10:00:00Z',
    flag: false,
  },
  {
    id: 2,
    text: 'Spam message',
    reporter: 'User2',
    abusive_author: 'Spammer',
    url: 'http://example.com/2',
    timestamp: '2025-09-05T12:30:00Z',
    flag: true,
  },
];

test.describe('Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.route('**/api/login', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    );

    // Mock reports API
    await page.route('**/api/reports', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReports),
      })
    );

    await page.goto('http://localhost:3001/login');

    // Login
    await page.getByLabel('Username').fill('admin@roasted.com');
    await page.getByLabel('Password').fill('1234567');
    await page.click('button:has-text("Log In")');

    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('navigate through dashboard pages', async ({ page }) => {
    await page.click('text=Reports');
    await expect(page.locator('h6:has-text("Reports")')).toBeVisible();

    await page.click('text=Statistics');
    await expect(page.locator('h6:has-text("Statistics")')).toBeVisible();

    await page.click('text=Settings');
    await expect(page.locator('h6:has-text("Settings")')).toBeVisible();
  });

  test('reports: verify table data', async ({ page }) => {
    await page.click('text=Reports');
    await expect(page.locator('text=Abusive comment')).toBeVisible();
    await expect(page.locator('text=Spam message')).toBeVisible();
  });

  test('reports: search, clear, and filter by date', async ({ page }) => {
    await page.click('text=Reports');

    const rowLocator = page.locator('.MuiDataGrid-row');

    // Search
    await page.getByPlaceholder('Search reports...').fill('Spam');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=Spam message')).toBeVisible();
    await expect(page.locator('text=Abusive comment')).not.toBeVisible();

    // Clear search
    await page.click('button:has-text("Clear")');
    await expect(page.locator('text=Abusive comment')).toBeVisible();

    // Date filter
    await page.locator('input[type="date"]').nth(0).fill('2025-09-03'); // Start Date
    await page.locator('input[type="date"]').nth(1).fill('2025-09-06'); // End Date
    await page.waitForTimeout(500); // wait for table update

    await expect(rowLocator).toHaveCount(1);
    await expect(rowLocator).toContainText('Spam message');
  });

  test('reports: delete, and export CSV', async ({ page }) => {
    await page.click('text=Reports');

    // Delete
    await page.route('**/api/reports', route => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({ status: 200, body: '{}' });
      }
      return route.continue();
    });
    await expect(page.locator('text=Abusive comment')).toBeVisible();
    await page.locator('input[name="select_row"]').first().click();
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Delete Selected")');
    await page.waitForTimeout(500);

    // Export CSV
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export CSV")'),
    ]);
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('displays general statistics correctly', async ({ page }) => {
    // Navigate to Statistics
    await page.click('text=Statistics');
    await expect(page.locator('text=Platform Statistics')).toBeVisible();
    const generalTable = page.locator('text=General').locator('..').locator('table');
    await expect(generalTable.locator('text=Total Reports')).toBeVisible();
    await expect(generalTable.locator('text=Flagged Reports')).toBeVisible();
    await expect(generalTable.locator('text=Average Reports per Day')).toBeVisible();
    await expect(generalTable.locator('text=Anonymous Reports')).toBeVisible();

    const totalReportsRow = generalTable.locator('tr', { hasText: 'Total Reports' });
    await expect(totalReportsRow.locator('td').nth(1)).toHaveText('1');
  });

  test('displays top domains', async ({ page }) => {
    await page.click('text=Statistics');
    const domainTable = page.locator('text=Top Domains').locator('..').locator('table');
    await expect(domainTable.locator('text=example.com')).toBeVisible();
  });

  test('displays top reporters', async ({ page }) => {
    await page.click('text=Statistics');
    const reportersTable = page.locator('text=Top Reporters').locator('..').locator('table');
    await expect(reportersTable.locator('text=User2')).toBeVisible();
  });

  // Change Email Tests
  test('updates email successfully', async ({ page }) => {
    await page.click('text=Settings');
    await page.route('**/api/change-email', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email updated successfully!' }),
      })
    );

    await page.getByLabel('Old Email').fill('old@example.com');
    await page.getByLabel('New Email').fill('new@example.com');
    await page.getByRole('button', { name: 'Update Email' }).click();

    await expect(page.getByRole('alert')).toHaveText('Email updated successfully!');
    await expect(page.getByLabel('Old Email')).toHaveValue('');
    await expect(page.getByLabel('New Email')).toHaveValue('');
  });

  test('shows email validation errors', async ({ page }) => {
    await page.click('text=Settings');
    const emailForm = page.locator('text=Change Email').locator('..');

    await emailForm.getByLabel('Old Email').fill('test@example.com');
    await emailForm.getByLabel('New Email').fill(''); // intentionally invalid
    await emailForm.getByRole('button', { name: 'Update Email' }).click();

    // Check validation alert
    await expect(emailForm.getByRole('alert')).toHaveText(
      'Please enter a valid new email address.'
    );
  });

  test('cancels email update', async ({ page }) => {
    await page.click('text=Settings');
    await page.getByLabel('Old Email').fill('test@example.com');
    await page.getByLabel('New Email').fill('new@example.com');
    const emailForm = page.locator('text=Change Email').locator('..');
    await emailForm.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByLabel('Old Email')).toHaveValue('');
    await expect(page.getByLabel('New Email')).toHaveValue('');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  // Change Password Tests
  test('updates password successfully', async ({ page }) => {
    await page.click('text=Settings');
    await page.route('**/api/change-password', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password updated successfully!' }),
      })
    );

    await page.getByLabel('Old Password').fill('oldpass123');
    await page.getByLabel('New Password').fill('newpass123');
    await page.getByLabel('Confirm Password').fill('newpass123');
    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByRole('alert')).toHaveText('Password updated successfully!');
    await expect(page.getByLabel('Old Password')).toHaveValue('');
    await expect(page.getByLabel('New Password')).toHaveValue('');
    await expect(page.getByLabel('Confirm Password')).toHaveValue('');
  });

  test('shows password mismatch error', async ({ page }) => {
    await page.click('text=Settings');
    await page.getByLabel('Old Password').fill('oldpass123');
    await page.getByLabel('New Password').fill('newpass123');
    await page.getByLabel('Confirm Password').fill('different123');
    await page.getByRole('button', { name: 'Update Password' }).click();

    await expect(page.getByRole('alert')).toHaveText('New password and confirmation do not match.');
  });

  test('shows password length error', async ({ page }) => {
    await page.click('text=Settings');
    const passwordForm = page.locator('text=Change Password').locator('..');
    await passwordForm.getByLabel('Old Password').fill('oldpass123');
    await passwordForm.getByLabel('New Password').fill('123');
    await passwordForm.getByLabel('Confirm Password').fill('123');
    await passwordForm.getByRole('button', { name: 'Update Password' }).click();

    await expect(passwordForm.getByRole('alert')).toHaveText('New password must be at least 6 characters.');
  });

  test('cancels password update', async ({ page }) => {
    await page.click('text=Settings');
    const passwordForm = page.locator('text=Change Password').locator('..');
    await passwordForm.getByLabel('Old Password').fill('oldpass123');
    await passwordForm.getByLabel('New Password').fill('newpass123');
    await passwordForm.getByLabel('Confirm Password').fill('newpass123');
    await passwordForm.getByRole('button', { name: 'Cancel' }).click();

    await expect(passwordForm.getByLabel('Old Password')).toHaveValue('');
    await expect(passwordForm.getByLabel('New Password')).toHaveValue('');
    await expect(passwordForm.getByLabel('Confirm Password')).toHaveValue('');
    await expect(passwordForm.getByRole('alert')).toHaveCount(0);
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    await page.route('**/api/login', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    );

    await page.goto('http://localhost:3001/login');

    await page.getByLabel('Username').fill('wronguser');
    await page.getByLabel('Password').fill('badpass');
    await page.click('button:has-text("Log In")');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should show network error when API is unreachable', async ({ page }) => {
    await page.route('**/api/login', route => route.abort());

    await page.goto('http://localhost:3001/login');

    await page.getByLabel('Username').fill('admin@roasted.com');
    await page.getByLabel('Password').fill('1234567');
    await page.click('button:has-text("Log In")');

    await expect(page.locator('text=Network error')).toBeVisible();
  });
});
