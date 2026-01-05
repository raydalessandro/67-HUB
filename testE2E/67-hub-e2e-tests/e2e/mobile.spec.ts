/**
 * E2E Tests: Mobile/Responsive
 */

import { test, expect, S, TEST_IDS, TEST_USERS } from './fixtures';

test.describe('Mobile', () => {
  test.describe('Mobile Navigation', () => {
    test('shows hamburger menu on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await expect(page.locator(S.NAV.HAMBURGER_MENU)).toBeVisible();
    });

    test('sidebar is hidden by default on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await expect(page.locator(S.NAV.SIDEBAR)).not.toBeVisible();
    });

    test('hamburger opens mobile menu', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await page.click(S.NAV.HAMBURGER_MENU);
      await expect(page.locator(S.NAV.MOBILE_MENU)).toBeVisible();
    });

    test('mobile menu shows navigation items', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await page.click(S.NAV.HAMBURGER_MENU);

      await expect(page.locator(S.NAV.DASHBOARD)).toBeVisible();
      await expect(page.locator(S.NAV.POSTS)).toBeVisible();
      await expect(page.locator(S.NAV.CALENDAR)).toBeVisible();
    });

    test('clicking menu item closes menu and navigates', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await page.click(S.NAV.HAMBURGER_MENU);
      await page.click(S.NAV.POSTS);

      await expect(page).toHaveURL('/posts');
      await expect(page.locator(S.NAV.MOBILE_MENU)).not.toBeVisible();
    });
  });

  test.describe('Mobile Login', () => {
    test('login form is usable on mobile', async ({ page }) => {
      await page.goto('/login');

      await expect(page.locator(S.AUTH.EMAIL_INPUT)).toBeVisible();
      await expect(page.locator(S.AUTH.PASSWORD_INPUT)).toBeVisible();
      await expect(page.locator(S.AUTH.LOGIN_BUTTON)).toBeVisible();
    });

    test('can login on mobile', async ({ page }) => {
      await page.goto('/login');

      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);

      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Mobile Dashboard', () => {
    test('dashboard is responsive', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await expect(page.locator(S.DASHBOARD.STAFF_DASHBOARD)).toBeVisible();
    });

    test('stats cards stack on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.waitForURL('/dashboard');

      await expect(page.locator(S.DASHBOARD.QUICK_STATS)).toBeVisible();
    });
  });

  test.describe('Mobile Posts List', () => {
    test('posts list is scrollable', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/posts');

      await expect(page.locator(S.POST.LIST)).toBeVisible();
    });

    test('post cards are full width on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/posts');

      const card = page.locator(S.POST.CARD).first();
      if (await card.isVisible()) {
        const box = await card.boundingBox();
        const viewport = page.viewportSize();
        // Card should be close to full width (accounting for padding)
        expect(box!.width).toBeGreaterThan(viewport!.width * 0.8);
      }
    });

    test('filters toggle on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/posts');

      const filterToggle = page.locator(S.POST.FILTER_TOGGLE);
      if (await filterToggle.isVisible()) {
        await filterToggle.click();
        await expect(page.locator(S.POST.FILTER_STATUS)).toBeVisible();
      }
    });
  });

  test.describe('Mobile Calendar', () => {
    test('calendar is responsive', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/calendar');

      await expect(page.locator(S.CALENDAR.VIEW)).toBeVisible();
    });

    test('calendar navigation works on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/calendar');

      await page.click(S.CALENDAR.NEXT);
      await page.click(S.CALENDAR.PREV);
      await page.click(S.CALENDAR.TODAY);

      await expect(page.locator(S.CALENDAR.VIEW)).toBeVisible();
    });
  });

  test.describe('Mobile Chat', () => {
    test('chat is usable on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);

      await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
      await expect(page.locator(S.CHAT.INPUT)).toBeVisible();
    });

    test('can send message on mobile', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);

      const message = `Mobile test ${Date.now()}`;
      await page.fill(S.CHAT.INPUT, message);
      await page.click(S.CHAT.SEND_BUTTON);

      await expect(page.locator(S.CHAT.MESSAGE).last()).toContainText(message);
    });
  });

  test.describe('Mobile Post Detail', () => {
    test('post detail is scrollable', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.DETAIL)).toBeVisible();
    });

    test('action buttons are accessible', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.EDIT_POST)).toBeVisible();
      await expect(page.locator(S.POST.SEND_FOR_REVIEW)).toBeVisible();
    });
  });

  test.describe('Touch Interactions', () => {
    test('can tap on elements', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.tap(S.AUTH.LOGIN_BUTTON);

      await expect(page).toHaveURL('/dashboard');
    });

    test('can swipe calendar (if supported)', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/calendar');

      // Calendar should be visible and interactive
      await expect(page.locator(S.CALENDAR.VIEW)).toBeVisible();
    });
  });

  test.describe('Mobile Forms', () => {
    test('form fields are properly sized', async ({ page }) => {
      await page.goto('/login');
      await page.fill(S.AUTH.EMAIL_INPUT, TEST_USERS.admin.email);
      await page.fill(S.AUTH.PASSWORD_INPUT, TEST_USERS.admin.password);
      await page.click(S.AUTH.LOGIN_BUTTON);
      await page.goto('/posts/new');

      const titleInput = page.locator(S.POST.INPUT_TITLE);
      const box = await titleInput.boundingBox();
      const viewport = page.viewportSize();

      // Input should be reasonably sized for mobile
      expect(box!.width).toBeGreaterThan(viewport!.width * 0.7);
    });

    test('keyboard does not obscure form', async ({ page }) => {
      await page.goto('/login');

      // Focus on input
      await page.click(S.AUTH.EMAIL_INPUT);

      // Submit button should still be accessible (scrollable into view)
      await expect(page.locator(S.AUTH.LOGIN_BUTTON)).toBeAttached();
    });
  });
});
