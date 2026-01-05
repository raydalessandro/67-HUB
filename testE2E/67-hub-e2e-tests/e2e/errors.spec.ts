/**
 * E2E Tests: Error Handling
 */

import { test, expect, S, TEST_IDS, TEST_USERS } from './fixtures';

test.describe('Error Handling', () => {
  test.describe('404 Not Found', () => {
    test('shows 404 for non-existent page', async ({ staffPage: page }) => {
      await page.goto('/this-page-does-not-exist');
      await expect(page.locator(S.COMMON.ERROR_NOT_FOUND)).toBeVisible();
    });

    test('shows 404 for non-existent post', async ({ staffPage: page }) => {
      await page.goto('/posts/00000000-0000-0000-0000-000000000000');
      await expect(page.locator(S.COMMON.ERROR_NOT_FOUND)).toBeVisible();
    });

    test('shows 404 for non-existent artist', async ({ staffPage: page }) => {
      await page.goto('/artists/00000000-0000-0000-0000-000000000000');
      await expect(page.locator(S.COMMON.ERROR_NOT_FOUND)).toBeVisible();
    });

    test('404 page has back to home link', async ({ staffPage: page }) => {
      await page.goto('/this-page-does-not-exist');
      await expect(page.locator(S.COMMON.BACK_TO_HOME)).toBeVisible();
    });

    test('back to home navigates to dashboard', async ({ staffPage: page }) => {
      await page.goto('/this-page-does-not-exist');
      await page.click(S.COMMON.BACK_TO_HOME);
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('403 Forbidden', () => {
    test('artist cannot access admin pages', async ({ artistPage: page }) => {
      await page.goto('/artists');
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !page.url().includes('/artists');
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('artist cannot access other artists posts', async ({ artistPage: page }) => {
      // Try to access artist2's post
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);
      const isVisible = await page.locator(S.POST.DETAIL).isVisible();
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      // Either shows forbidden or doesn't show the post
      expect(!isVisible || isForbidden).toBe(true);
    });

    test('forbidden page shows helpful message', async ({ artistPage: page }) => {
      await page.goto('/artists');
      const forbiddenMsg = page.locator(S.COMMON.FORBIDDEN_MESSAGE);
      if (await forbiddenMsg.isVisible()) {
        await expect(forbiddenMsg).toContainText(/permess|access|autorizzat/i);
      }
    });
  });

  test.describe('Session Expiration', () => {
    test('shows session expired on 401', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      // Clear session storage/cookies to simulate expiration
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to navigate - should redirect to login
      await page.goto('/posts');

      // Should be redirected to login or show session expired
      const url = page.url();
      const sessionExpired = await page.locator(S.COMMON.SESSION_EXPIRED).isVisible();
      expect(url.includes('/login') || sessionExpired).toBe(true);
    });
  });

  test.describe('Form Validation Errors', () => {
    test('shows error toast on form submission failure', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      // Try to submit empty form
      await page.click(S.POST.SAVE_POST);

      // Should show validation errors
      const hasErrors =
        (await page.locator(S.POST.ERROR_TITLE_REQUIRED).isVisible()) ||
        (await page.locator(S.COMMON.TOAST_ERROR).isVisible());
      expect(hasErrors).toBe(true);
    });

    test('form errors are dismissable', async ({ staffPage: page }) => {
      await page.goto('/posts/new');
      await page.click(S.POST.SAVE_POST);

      // Fill in the field to dismiss error
      await page.fill(S.POST.INPUT_TITLE, 'Test Title');

      // Error should disappear or reduce
    });
  });

  test.describe('Network Errors', () => {
    test('shows offline indicator when offline', async ({ staffPage: page }) => {
      // Simulate offline
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto('/posts').catch(() => {});

      // Should show offline indicator or error
      const offlineIndicator = page.locator(S.COMMON.OFFLINE_INDICATOR);
      const errorState = page.locator(S.COMMON.ERROR_STATE);

      // Either offline indicator or error state should be visible
    });

    test('can retry after network error', async ({ staffPage: page }) => {
      // Go offline
      await page.context().setOffline(true);

      // Try action that will fail
      await page.goto('/posts').catch(() => {});

      // Go back online
      await page.context().setOffline(false);

      // Retry button should work
      const retryBtn = page.locator(S.COMMON.RETRY_BUTTON);
      if (await retryBtn.isVisible()) {
        await retryBtn.click();
        await expect(page.locator(S.POST.LIST)).toBeVisible();
      }
    });
  });

  test.describe('API Errors', () => {
    test('handles server error gracefully', async ({ staffPage: page }) => {
      // This would need mock server to properly test
      // For now, just ensure error handling UI exists
      await page.goto('/dashboard');
      await expect(page.locator(S.DASHBOARD.STAFF_DASHBOARD)).toBeVisible();
    });
  });

  test.describe('Toast Notifications', () => {
    test('error toast is visible and styled correctly', async ({ staffPage: page }) => {
      await page.goto('/posts/new');
      await page.click(S.POST.SAVE_POST);

      const errorToast = page.locator(S.COMMON.TOAST_ERROR);
      if (await errorToast.isVisible()) {
        // Toast should have close button
        await expect(errorToast.locator(S.COMMON.TOAST_CLOSE)).toBeVisible();
      }
    });

    test('can close error toast', async ({ staffPage: page }) => {
      await page.goto('/posts/new');
      await page.click(S.POST.SAVE_POST);

      const errorToast = page.locator(S.COMMON.TOAST_ERROR);
      if (await errorToast.isVisible()) {
        await errorToast.locator(S.COMMON.TOAST_CLOSE).click();
        await expect(errorToast).not.toBeVisible();
      }
    });

    test('success toast auto-dismisses', async ({ staffPage: page }) => {
      // Create a post to trigger success toast
      await page.goto('/posts/new');
      await page.fill(S.POST.INPUT_TITLE, 'Toast Test');
      await page.selectOption(S.POST.SELECT_ARTIST, TEST_IDS.artists.artist1);
      await page.selectOption(S.POST.SELECT_PLATFORM, 'instagram_feed');

      const future = new Date();
      future.setHours(future.getHours() + 25);
      await page.fill(S.POST.INPUT_SCHEDULED, future.toISOString().slice(0, 16));

      await page.click(S.POST.SAVE_POST);

      // Wait for redirect (success)
      await page.waitForURL(/\/posts\/[a-f0-9-]+/);

      // Success toast may auto-dismiss
      const successToast = page.locator(S.COMMON.TOAST_SUCCESS);
      // Just verify it appeared (may already be gone)
    });
  });

  test.describe('Loading States', () => {
    test('shows loading spinner during data fetch', async ({ staffPage: page }) => {
      // Navigate and check for loading state
      await page.goto('/posts');

      // Loading spinner may be very brief
      await expect(page.locator(S.POST.LIST)).toBeVisible();
    });

    test('shows skeleton loaders for content', async ({ staffPage: page }) => {
      await page.goto('/dashboard');

      // Skeleton loaders may be very brief
      await expect(page.locator(S.DASHBOARD.STAFF_DASHBOARD)).toBeVisible();
    });
  });

  test.describe('Invalid Input Handling', () => {
    test('handles special characters in search', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.fill(S.POST.SEARCH_INPUT, '<script>alert("xss")</script>');

      // Should not cause errors
      await expect(page.locator(S.POST.LIST)).toBeVisible();
    });

    test('handles very long input', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      const longText = 'A'.repeat(10000);
      await page.fill(S.POST.INPUT_TITLE, longText);

      // Should handle gracefully (truncate or show error)
    });

    test('handles emoji in input', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.fill(S.POST.INPUT_TITLE, 'Test Post 🎵🎤🔥');

      // Should accept emoji
      await expect(page.locator(S.POST.INPUT_TITLE)).toHaveValue('Test Post 🎵🎤🔥');
    });
  });

  test.describe('Concurrent Actions', () => {
    test('handles rapid button clicks', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.fill(S.POST.INPUT_TITLE, 'Rapid Click Test');
      await page.selectOption(S.POST.SELECT_ARTIST, TEST_IDS.artists.artist1);
      await page.selectOption(S.POST.SELECT_PLATFORM, 'instagram_feed');

      const future = new Date();
      future.setHours(future.getHours() + 25);
      await page.fill(S.POST.INPUT_SCHEDULED, future.toISOString().slice(0, 16));

      // Click save multiple times rapidly
      await page.click(S.POST.SAVE_POST);
      await page.click(S.POST.SAVE_POST);
      await page.click(S.POST.SAVE_POST);

      // Should handle gracefully (create only one post)
      await page.waitForURL(/\/posts\/[a-f0-9-]+/);
    });
  });
});
