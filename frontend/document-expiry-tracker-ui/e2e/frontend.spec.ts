import { test, expect } from '@playwright/test';

async function demo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Explore demo' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test('authentication guard, validation, registration and logout', async ({ page }) => {
  await page.goto('/documents');
  await expect(page).toHaveURL(/login/);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByRole('link', { name: 'Create Account', exact: true }).click();
  await page.getByLabel('Full Name').fill('Test Person');
  await page.getByLabel('Email', { exact: false }).fill('test@example.com');
  await page.getByLabel('Password *', { exact: true }).fill('password123');
  await page.getByLabel('Confirm Password').fill('different123');
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await expect(page.getByText('Passwords must match.')).toBeVisible();
  await page.getByLabel('Confirm Password').fill('password123');
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Test');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/login/);
});

test('document CRUD, validation, search, filters, pagination and delete cancellation', async ({
  page,
}) => {
  await demo(page);
  await page.getByRole('link', { name: 'Add Document', exact: true }).first().click();
  await page.getByRole('button', { name: 'Save Document' }).click();
  await expect(page.getByText('Enter a document name')).toBeVisible();
  await page.getByLabel('Document Name').fill('Renewal Test');
  await page.getByLabel('Category').selectOption({ label: 'Passport' });
  await page.getByLabel('Issue Date').fill('2027-02-01');
  await page.getByLabel('Expiry Date').fill('2027-01-01');
  await expect(page.getByText('Issue date and reminder date must')).toBeVisible();
  await page.getByLabel('Issue Date').fill('2026-01-01');
  await page.getByLabel('Document Number').fill('E2E-100');
  await page.getByLabel('Issued By').fill('Test Issuer');
  const file = { name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from('sample') };
  await page.locator('input[type=file]').setInputFiles(file);
  await expect(page.locator('.file-preview')).toContainText('sample.pdf');
  await page.getByRole('button', { name: 'Remove attachment' }).click();
  await expect(page.locator('input[type=file]')).toHaveValue('');
  await page.locator('input[type=file]').setInputFiles(file);
  await expect(page.locator('.file-preview')).toContainText('sample.pdf');
  await page.getByRole('button', { name: 'Save Document' }).click();
  await expect(page.getByRole('heading', { name: 'Renewal Test', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Edit Document' }).click();
  await expect(page.getByLabel('Document Name')).toHaveValue('Renewal Test');
  await page.getByLabel('Document Name').fill('Renewal Updated');
  await page.getByRole('button', { name: 'Update Document' }).click();
  await expect(page.getByRole('heading', { name: 'Renewal Updated' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Renewal Updated' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Documents' }).click();
  await page.getByRole('searchbox').fill('E2E-100');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('searchbox').fill('Test Issuer');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('searchbox').fill('no such document');
  await expect(page.getByText('No matching documents')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Page 2 of 2')).toBeVisible();
  await page.getByRole('searchbox').fill('Renewal Updated');
  await expect(page.getByText('Page 1 of 1')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Renewal Updated' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Renewal Updated Test Issuer' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete Renewal Updated' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('No matching documents')).toBeVisible();
});

test('categories, preferences, profile and reminders work', async ({ page }) => {
  await demo(page);
  await page.getByRole('link', { name: 'Categories', exact: true }).click();
  await page.getByLabel('Category Name').fill('Travel');
  await page.getByRole('button', { name: 'Add Category', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Travel', exact: true })).toBeVisible();
  await page.getByLabel('Category Name').fill('Travel');
  await page.getByRole('button', { name: 'Add Category', exact: true }).click();
  await expect(page.getByText('A category with this name already exists.')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Travel', exact: true }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Travel', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Expiry Warning Period').selectOption({ label: '7 Days' });
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('Within the next 7 days')).toBeVisible();
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.getByLabel('Full Name').fill('Updated Person');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: 'Updated Person' })).toBeVisible();
  await page.getByRole('link', { name: 'Reminders', exact: true }).click();
  const today = page
    .locator('.reminder-section')
    .filter({ has: page.getByRole('heading', { name: 'Today', exact: true }) });
  await today.getByRole('button', { name: 'Dismiss', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toHaveCount(0);
});

test('responsive layouts and all routes render without overflow or browser errors', async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await demo(page);
  for (const width of [1920, 1440, 1024, 768, 480, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      '/dashboard',
      '/documents',
      '/documents/add',
      '/documents/1',
      '/documents/1/edit',
      '/categories',
      '/reminders',
      '/profile',
      '/settings',
    ]) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await expect(page.getByRole('link', { name: 'Documents', exact: true })).toBeInViewport();
  await page.getByRole('link', { name: 'Documents', exact: true }).click();
  await expect(page.locator('.sidebar')).not.toHaveClass(/is-open/);
  await expect(page.locator('.sidebar')).toHaveAttribute('inert', '');
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  for (const route of ['/login', '/register']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(errors).toEqual([]);
});

test('capture dashboard and mobile layouts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await demo(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true, animations: 'disabled' });
  await page.goto('/documents/add');
  await page.screenshot({ path: 'test-results/add-document-mobile.png', fullPage: true, animations: 'disabled' });
});
