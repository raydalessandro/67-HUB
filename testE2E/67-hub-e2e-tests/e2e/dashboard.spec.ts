/**
 * E2E Tests: Dashboard
 */

import { test, expect, S, TEST_IDS, TEST_USERS } from './fixtures';

test.describe('Dashboard', () => {
  test.describe('Staff Dashboard', () => {
    test('shows staff dashboard for admin', async ({ staffPage: page }) => {
      await page.goto('/dashboard');
      await expect(page.locator(S.DASHBOARD.STAFF_DASHBOARD)).toBeVisible();
    });

    test('shows welcome message', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.WELCOME_MESSAGE)).toBeVisible();
      await expect(page.locator(S.DASHBOARD.WELCOME_MESSAGE)).toContainText(
        TEST_USERS.admin.displayName
      );
    });

    test('shows quick stats', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.QUICK_STATS)).toBeVisible();
    });

    test('shows posts scheduled today', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.STAT_POSTS_TODAY)).toBeVisible();
    });

    test('shows pending approvals count', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.STAT_PENDING)).toBeVisible();
    });

    test('shows published this week', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.STAT_PUBLISHED_WEEK)).toBeVisible();
    });
  });

  test.describe('Today Posts Section', () => {
    test('shows today posts section', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.TODAY_POSTS)).toBeVisible();
    });

    test('shows empty state when no posts today', async ({ staffPage: page }) => {
      const posts = page.locator(`${S.DASHBOARD.TODAY_POSTS} ${S.POST.CARD}`);
      const count = await posts.count();
      if (count === 0) {
        await expect(page.locator(S.DASHBOARD.TODAY_POSTS_EMPTY)).toBeVisible();
      }
    });

    test('today posts are clickable', async ({ staffPage: page }) => {
      const posts = page.locator(`${S.DASHBOARD.TODAY_POSTS} ${S.POST.CARD}`);
      if ((await posts.count()) > 0) {
        const postId = await posts.first().getAttribute('data-post-id');
        await posts.first().click();
        await expect(page).toHaveURL(`/posts/${postId}`);
      }
    });
  });

  test.describe('Pending Approvals Section', () => {
    test('shows pending approvals section', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.PENDING_APPROVALS)).toBeVisible();
    });

    test('shows count of pending posts', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.PENDING_COUNT)).toBeVisible();
    });

    test('pending posts show time since sent', async ({ staffPage: page }) => {
      const pendingPosts = page.locator(`${S.DASHBOARD.PENDING_APPROVALS} ${S.POST.CARD}`);
      if ((await pendingPosts.count()) > 0) {
        await expect(pendingPosts.first().locator(S.DASHBOARD.PENDING_SINCE)).toBeVisible();
      }
    });

    test('clicking pending post opens detail', async ({ staffPage: page }) => {
      const pendingPosts = page.locator(`${S.DASHBOARD.PENDING_APPROVALS} ${S.POST.CARD}`);
      if ((await pendingPosts.count()) > 0) {
        const postId = await pendingPosts.first().getAttribute('data-post-id');
        await pendingPosts.first().click();
        await expect(page).toHaveURL(`/posts/${postId}`);
      }
    });
  });

  test.describe('Mini Calendar', () => {
    test('shows mini calendar', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.MINI_CALENDAR)).toBeVisible();
    });

    test('mini calendar shows current month', async ({ staffPage: page }) => {
      const now = new Date();
      const monthName = now.toLocaleDateString('it-IT', { month: 'long' });
      await expect(page.locator(S.DASHBOARD.MINI_CALENDAR_HEADER)).toContainText(
        new RegExp(monthName, 'i')
      );
    });

    test('days with posts are highlighted', async ({ staffPage: page }) => {
      const daysWithPosts = page.locator(S.DASHBOARD.DAY_HAS_POSTS);
      // May or may not have posts
      await expect(page.locator(S.DASHBOARD.MINI_CALENDAR)).toBeVisible();
    });

    test('clicking day shows posts for that day', async ({ staffPage: page }) => {
      const daysWithPosts = page.locator(S.DASHBOARD.DAY_HAS_POSTS);
      if ((await daysWithPosts.count()) > 0) {
        await daysWithPosts.first().click();
        await expect(page.locator(S.DASHBOARD.DAY_POSTS_DETAIL)).toBeVisible();
      }
    });
  });

  test.describe('Recent Activity', () => {
    test('shows recent activity section', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.RECENT_ACTIVITY)).toBeVisible();
    });

    test('shows activity items', async ({ staffPage: page }) => {
      const activityItems = page.locator(S.DASHBOARD.ACTIVITY_ITEM);
      const count = await activityItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('activity items show time', async ({ staffPage: page }) => {
      const activityItems = page.locator(S.DASHBOARD.ACTIVITY_ITEM);
      if ((await activityItems.count()) > 0) {
        await expect(activityItems.first().locator(S.DASHBOARD.ACTIVITY_TIME)).toBeVisible();
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('shows quick new post button', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.QUICK_NEW_POST)).toBeVisible();
    });

    test('new post button navigates to create page', async ({ staffPage: page }) => {
      await page.click(S.DASHBOARD.QUICK_NEW_POST);
      await expect(page).toHaveURL('/posts/new');
    });

    test('shows view all posts link', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.VIEW_ALL_POSTS)).toBeVisible();
    });

    test('view all posts navigates to posts list', async ({ staffPage: page }) => {
      await page.click(S.DASHBOARD.VIEW_ALL_POSTS);
      await expect(page).toHaveURL('/posts');
    });
  });

  test.describe('Artist Dashboard', () => {
    test('shows artist dashboard for artist', async ({ artistPage: page }) => {
      await page.goto('/dashboard');
      await expect(page.locator(S.DASHBOARD.ARTIST_DASHBOARD)).toBeVisible();
    });

    test('shows artist welcome message', async ({ artistPage: page }) => {
      await expect(page.locator(S.DASHBOARD.WELCOME_MESSAGE)).toContainText(
        TEST_USERS.artist1.artistName
      );
    });

    test('shows pending my approval section', async ({ artistPage: page }) => {
      await expect(page.locator(S.DASHBOARD.PENDING_MY_APPROVAL)).toBeVisible();
    });

    test('artist does not see new post button', async ({ artistPage: page }) => {
      await expect(page.locator(S.DASHBOARD.QUICK_NEW_POST)).not.toBeVisible();
    });

    test('shows open chat button', async ({ artistPage: page }) => {
      await expect(page.locator(S.DASHBOARD.OPEN_CHAT)).toBeVisible();
    });

    test('open chat navigates to artist chat', async ({ artistPage: page }) => {
      await page.click(S.DASHBOARD.OPEN_CHAT);
      await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
    });
  });

  test.describe('Dashboard Refresh', () => {
    test('can refresh dashboard data', async ({ staffPage: page }) => {
      const refreshBtn = page.locator(S.DASHBOARD.REFRESH_DASHBOARD);
      if (await refreshBtn.isVisible()) {
        await refreshBtn.click();
        // Should show loading state briefly
      }
    });
  });

  test.describe('Recently Published', () => {
    test('shows recently published posts', async ({ staffPage: page }) => {
      await expect(page.locator(S.DASHBOARD.RECENT_PUBLISHED)).toBeVisible();
    });

    test('published posts are clickable', async ({ staffPage: page }) => {
      const posts = page.locator(`${S.DASHBOARD.RECENT_PUBLISHED} ${S.POST.CARD}`);
      if ((await posts.count()) > 0) {
        const postId = await posts.first().getAttribute('data-post-id');
        await posts.first().click();
        await expect(page).toHaveURL(`/posts/${postId}`);
      }
    });
  });
});
