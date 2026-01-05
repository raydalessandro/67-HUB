/**
 * E2E Tests: Authentication
 */

import { test, expect, S, TEST_USERS, TEST_IDS } from './fixtures';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('shows login form on /login', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await expect(page.locator(S.AUTH.LOGIN_FORM)).toBeVisible();
      await expect(page.locator(S.AUTH.EMAIL_INPUT)).toBeVisible();
      await expect(page.locator(S.AUTH.PASSWORD_INPUT)).toBeVisible();
      await expect(page.locator(S.AUTH.LOGIN_BUTTON)).toBeVisible();
    });

    test('admin can login successfully', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator(S.DASHBOARD.STAFF_DASHBOARD)).toBeVisible();
    });

    test('artist can login successfully', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.artist1.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.artist1.password);
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator(S.DASHBOARD.ARTIST_DASHBOARD)).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, 'wrong@email.com');
      await page.fill(S.AUTH.PASSWORD_INPUT, 'wrongpassword');
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page.locator(S.AUTH.ERROR_INVALID_CREDENTIALS)).toBeVisible();
      await expect(page).toHaveURL('/login');
    });

    test('shows error for empty email', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.PASSWORD_INPUT, 'somepassword');
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page.locator(S.AUTH.ERROR_EMAIL_REQUIRED)).toBeVisible();
    });

    test('shows error for empty password', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, 'test@test.com');
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page.locator(S.AUTH.ERROR_PASSWORD_REQUIRED)).toBeVisible();
    });

    test('shows error for invalid email format', async ({ unauthenticatedPage: page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, 'notanemail');
      await page.fill(S.AUTH.PASSWORD_INPUT, 'somepassword');
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page.locator(S.AUTH.ERROR_EMAIL_INVALID)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('user can logout', async ({ staffPage: page }) => {
      await page.click(S.AUTH.USER_MENU);
      await page.click(S.AUTH.LOGOUT_BUTTON);

      await expect(page).toHaveURL('/login');
      await expect(page.locator(S.AUTH.LOGIN_FORM)).toBeVisible();
    });

    test('after logout cannot access protected pages', async ({ staffPage: page }) => {
      await page.click(S.AUTH.USER_MENU);
      await page.click(S.AUTH.LOGOUT_BUTTON);
      await page.waitForURL('/login');

      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Route Protection', () => {
    test('unauthenticated user is redirected to login', async ({ unauthenticatedPage: page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
    });

    test('unauthenticated user cannot access /posts', async ({ unauthenticatedPage: page }) => {
      await page.goto('/posts');
      await expect(page).toHaveURL('/login');
    });

    test('unauthenticated user cannot access /calendar', async ({ unauthenticatedPage: page }) => {
      await page.goto('/calendar');
      await expect(page).toHaveURL('/login');
    });

    test('artist cannot access /artists management', async ({ artistPage: page }) => {
      await page.goto('/artists');

      const url = page.url();
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !url.includes('/artists');

      expect(isForbidden || isRedirected).toBe(true);
    });
  });

  test.describe('Role Display', () => {
    test('shows admin role for admin user', async ({ staffPage: page }) => {
      await page.click(S.AUTH.USER_MENU);
      await expect(page.locator(S.AUTH.USER_ROLE)).toContainText(/admin/i);
    });

    test('shows artist role for artist user', async ({ artistPage: page }) => {
      await page.click(S.AUTH.USER_MENU);
      await expect(page.locator(S.AUTH.USER_ROLE)).toContainText(/artist/i);
    });

    test('shows user name in menu', async ({ staffPage: page }) => {
      await page.click(S.AUTH.USER_MENU);
      await expect(page.locator(S.AUTH.USER_NAME)).toContainText(TEST_USERS.admin.displayName);
    });
  });
});
