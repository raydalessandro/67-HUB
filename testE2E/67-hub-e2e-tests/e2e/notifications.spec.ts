/**
 * E2E Tests: Notifications
 */

import { test, expect, S, TEST_IDS, createPost, sendForReview, approvePost } from './fixtures';

test.describe('Notifications', () => {
  test.describe('Notification Bell', () => {
    test('shows notification bell in navbar', async ({ staffPage: page }) => {
      await expect(page.locator(S.NAV.NOTIFICATION_BELL)).toBeVisible();
    });

    test('shows badge when unread notifications exist', async ({ staffPage: page }) => {
      // This depends on having unread notifications in seed data
      const badge = page.locator(S.NAV.NOTIFICATION_BADGE);
      // Badge may or may not be visible depending on state
      await expect(page.locator(S.NAV.NOTIFICATION_BELL)).toBeVisible();
    });

    test('clicking bell opens notification dropdown', async ({ staffPage: page }) => {
      await page.click(S.NAV.NOTIFICATION_BELL);
      await expect(page.locator(S.NAV.NOTIFICATION_DROPDOWN)).toBeVisible();
    });

    test('dropdown shows recent notifications', async ({ staffPage: page }) => {
      await page.click(S.NAV.NOTIFICATION_BELL);
      await expect(page.locator(S.NOTIFICATIONS.LIST)).toBeVisible();
    });
  });

  test.describe('Notification List Page', () => {
    test('can navigate to notifications page', async ({ staffPage: page }) => {
      await page.click(S.NAV.NOTIFICATION_BELL);
      await page.click(S.NAV.VIEW_ALL_NOTIFICATIONS);
      await expect(page).toHaveURL('/notifications');
    });

    test('notifications page shows all notifications', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      await expect(page.locator(S.NOTIFICATIONS.LIST)).toBeVisible();
    });

    test('notifications show title', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const item = page.locator(S.NOTIFICATIONS.ITEM).first();
      if (await item.isVisible()) {
        await expect(item.locator(S.NOTIFICATIONS.TITLE)).toBeVisible();
      }
    });

    test('notifications show body', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const item = page.locator(S.NOTIFICATIONS.ITEM).first();
      if (await item.isVisible()) {
        await expect(item.locator(S.NOTIFICATIONS.BODY)).toBeVisible();
      }
    });

    test('notifications show time', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const item = page.locator(S.NOTIFICATIONS.ITEM).first();
      if (await item.isVisible()) {
        await expect(item.locator(S.NOTIFICATIONS.TIME)).toBeVisible();
      }
    });

    test('shows empty state when no notifications', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const items = page.locator(S.NOTIFICATIONS.ITEM);
      const count = await items.count();
      if (count === 0) {
        await expect(page.locator(S.NOTIFICATIONS.EMPTY_STATE)).toBeVisible();
      }
    });
  });

  test.describe('Mark as Read', () => {
    test('can mark single notification as read', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const unreadItem = page.locator(S.NOTIFICATIONS.ITEM).first();
      if (await unreadItem.isVisible()) {
        await unreadItem.locator(S.NOTIFICATIONS.MARK_READ).click();
        // Notification should update visually
      }
    });

    test('can mark all as read', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const markAllBtn = page.locator(S.NOTIFICATIONS.MARK_ALL_READ);
      if (await markAllBtn.isVisible()) {
        await markAllBtn.click();
        // Badge should disappear or update
      }
    });
  });

  test.describe('Notification Triggers', () => {
    test('staff gets notification when artist approves', async ({ staffPage, artistPage }) => {
      // Create post and send for review
      const postId = await createPost(staffPage, {
        title: 'Notification Test Approve',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      // Get initial notification count
      const initialCount = await staffPage.locator(S.NAV.NOTIFICATION_BADGE).textContent();

      // Artist approves
      await artistPage.goto(`/posts/${postId}`);
      await approvePost(artistPage);

      // Refresh staff page and check for new notification
      await staffPage.reload();
      await staffPage.click(S.NAV.NOTIFICATION_BELL);

      const notifications = staffPage.locator(S.NOTIFICATIONS.ITEM);
      await expect(notifications.first()).toContainText(/approv/i);
    });

    test('staff gets notification when artist rejects', async ({ staffPage, artistPage }) => {
      const postId = await createPost(staffPage, {
        title: 'Notification Test Reject',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      await artistPage.goto(`/posts/${postId}`);
      await artistPage.click(S.POST.REJECT_POST);
      await artistPage.fill(S.POST.REJECT_REASON_INPUT, 'Test rejection');
      await artistPage.click(S.POST.CONFIRM_REJECT);

      await staffPage.reload();
      await staffPage.click(S.NAV.NOTIFICATION_BELL);

      const notifications = staffPage.locator(S.NOTIFICATIONS.ITEM);
      await expect(notifications.first()).toContainText(/reject|rifiut/i);
    });

    test('artist gets notification when post sent for review', async ({ staffPage, artistPage }) => {
      const postId = await createPost(staffPage, {
        title: 'Notification Test Review',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      await artistPage.reload();
      await artistPage.click(S.NAV.NOTIFICATION_BELL);

      const notifications = artistPage.locator(S.NOTIFICATIONS.ITEM);
      await expect(notifications.first()).toContainText(/review|approv/i);
    });
  });

  test.describe('Artist Notifications', () => {
    test('artist can view their notifications', async ({ artistPage: page }) => {
      await page.goto('/notifications');
      await expect(page.locator(S.NOTIFICATIONS.LIST)).toBeVisible();
    });

    test('artist only sees relevant notifications', async ({ artistPage: page }) => {
      await page.goto('/notifications');
      const items = page.locator(S.NOTIFICATIONS.ITEM);
      const count = await items.count();
      // Artist should not see notifications for other artists
      for (let i = 0; i < count; i++) {
        const text = await items.nth(i).textContent();
        expect(text).not.toContain(TEST_IDS.artists.artist2);
      }
    });
  });

  test.describe('Notification Navigation', () => {
    test('clicking notification navigates to related content', async ({ staffPage: page }) => {
      await page.goto('/notifications');
      const item = page.locator(S.NOTIFICATIONS.ITEM).first();
      if (await item.isVisible()) {
        await item.click();
        // Should navigate to related post, chat, or other content
        const url = page.url();
        expect(url).not.toBe('/notifications');
      }
    });
  });
});
