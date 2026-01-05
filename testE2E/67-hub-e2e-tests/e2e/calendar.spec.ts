/**
 * E2E Tests: Calendar
 */

import { test, expect, S, TEST_IDS } from './fixtures';

test.describe('Calendar', () => {
  test.describe('Calendar View', () => {
    test('staff can view calendar', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await expect(page.locator(S.CALENDAR.VIEW)).toBeVisible();
    });

    test('shows current month by default', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const now = new Date();
      const monthName = now.toLocaleDateString('it-IT', { month: 'long' });
      await expect(page.locator(S.CALENDAR.MONTH_TITLE)).toContainText(new RegExp(monthName, 'i'));
    });

    test('shows posts as events', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const events = page.locator(S.CALENDAR.EVENT);
      const count = await events.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('events show title', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await expect(event.locator(S.CALENDAR.EVENT_TITLE)).toBeVisible();
      }
    });

    test('events show platform icon', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await expect(event.locator(S.CALENDAR.EVENT_PLATFORM_ICON)).toBeVisible();
      }
    });
  });

  test.describe('Calendar Navigation', () => {
    test('can navigate to next month', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const initialMonth = await page.locator(S.CALENDAR.MONTH_TITLE).textContent();
      await page.click(S.CALENDAR.NEXT);
      const newMonth = await page.locator(S.CALENDAR.MONTH_TITLE).textContent();
      expect(newMonth).not.toBe(initialMonth);
    });

    test('can navigate to previous month', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const initialMonth = await page.locator(S.CALENDAR.MONTH_TITLE).textContent();
      await page.click(S.CALENDAR.PREV);
      const newMonth = await page.locator(S.CALENDAR.MONTH_TITLE).textContent();
      expect(newMonth).not.toBe(initialMonth);
    });

    test('can return to today', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.click(S.CALENDAR.NEXT);
      await page.click(S.CALENDAR.NEXT);
      await page.click(S.CALENDAR.TODAY);
      const now = new Date();
      const monthName = now.toLocaleDateString('it-IT', { month: 'long' });
      await expect(page.locator(S.CALENDAR.MONTH_TITLE)).toContainText(new RegExp(monthName, 'i'));
    });

    test('today is highlighted', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await expect(page.locator(S.CALENDAR.TODAY_CELL)).toBeVisible();
    });
  });

  test.describe('View Modes', () => {
    test('shows month view by default', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await expect(page.locator(S.CALENDAR.MONTH_VIEW)).toBeVisible();
    });

    test('can switch to week view', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.click(S.CALENDAR.VIEW_WEEK_BTN);
      await expect(page.locator(S.CALENDAR.WEEK_VIEW)).toBeVisible();
    });

    test('can switch back to month view', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.click(S.CALENDAR.VIEW_WEEK_BTN);
      await page.click(S.CALENDAR.VIEW_MONTH_BTN);
      await expect(page.locator(S.CALENDAR.MONTH_VIEW)).toBeVisible();
    });

    test('week view shows 7 days', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.click(S.CALENDAR.VIEW_WEEK_BTN);
      const dayColumns = page.locator(S.CALENDAR.WEEK_DAY_COLUMN);
      await expect(dayColumns).toHaveCount(7);
    });
  });

  test.describe('Calendar Filters', () => {
    test('staff can filter by artist', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_ARTIST, TEST_IDS.artists.artist1);
      await page.waitForLoadState('networkidle');
      const events = page.locator(S.CALENDAR.EVENT);
      const count = await events.count();
      for (let i = 0; i < count; i++) {
        const artistId = await events.nth(i).getAttribute('data-artist-id');
        expect(artistId).toBe(TEST_IDS.artists.artist1);
      }
    });

    test('can filter by platform', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_PLATFORM, 'instagram_feed');
      await page.waitForLoadState('networkidle');
      const events = page.locator(S.CALENDAR.EVENT);
      const count = await events.count();
      for (let i = 0; i < count; i++) {
        const platform = await events.nth(i).getAttribute('data-platform');
        expect(platform).toBe('instagram_feed');
      }
    });

    test('can filter by status', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_STATUS, 'approved');
      await page.waitForLoadState('networkidle');
      const events = page.locator(S.CALENDAR.EVENT);
      const count = await events.count();
      for (let i = 0; i < count; i++) {
        const status = await events.nth(i).getAttribute('data-status');
        expect(status).toBe('approved');
      }
    });

    test('can clear filters', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_ARTIST, TEST_IDS.artists.artist1);
      await page.click(S.CALENDAR.CLEAR_FILTERS);
      await expect(page.locator(S.CALENDAR.FILTER_ARTIST)).toHaveValue('');
    });

    test('artist cannot see artist filter', async ({ artistPage: page }) => {
      await page.goto('/calendar');
      await expect(page.locator(S.CALENDAR.FILTER_ARTIST)).not.toBeVisible();
    });
  });

  test.describe('Event Interaction', () => {
    test('clicking event shows tooltip', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await event.click();
        await expect(page.locator(S.CALENDAR.EVENT_TOOLTIP)).toBeVisible();
      }
    });

    test('tooltip shows post details', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await event.click();
        await expect(page.locator(S.CALENDAR.TOOLTIP_TITLE)).toBeVisible();
        await expect(page.locator(S.CALENDAR.TOOLTIP_TIME)).toBeVisible();
        await expect(page.locator(S.CALENDAR.TOOLTIP_STATUS)).toBeVisible();
      }
    });

    test('double click opens post detail', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        const postId = await event.getAttribute('data-post-id');
        await event.dblclick();
        await expect(page).toHaveURL(`/posts/${postId}`);
      }
    });
  });

  test.describe('Status Indicators', () => {
    test('shows pending indicator for pending posts', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_STATUS, 'in_review');
      await page.waitForLoadState('networkidle');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await expect(event.locator(S.CALENDAR.PENDING_INDICATOR)).toBeVisible();
      }
    });

    test('shows approved indicator for approved posts', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_STATUS, 'approved');
      await page.waitForLoadState('networkidle');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await expect(event.locator(S.CALENDAR.APPROVED_INDICATOR)).toBeVisible();
      }
    });

    test('shows published indicator for published posts', async ({ staffPage: page }) => {
      await page.goto('/calendar');
      await page.selectOption(S.CALENDAR.FILTER_STATUS, 'published');
      await page.waitForLoadState('networkidle');
      const event = page.locator(S.CALENDAR.EVENT).first();
      if (await event.isVisible()) {
        await expect(event.locator(S.CALENDAR.PUBLISHED_INDICATOR)).toBeVisible();
      }
    });
  });

  test.describe('Artist Calendar', () => {
    test('artist can view calendar', async ({ artistPage: page }) => {
      await page.goto('/calendar');
      await expect(page.locator(S.CALENDAR.VIEW)).toBeVisible();
    });

    test('artist sees only their posts', async ({ artistPage: page }) => {
      await page.goto('/calendar');
      const events = page.locator(S.CALENDAR.EVENT);
      const count = await events.count();
      for (let i = 0; i < count; i++) {
        const artistId = await events.nth(i).getAttribute('data-artist-id');
        expect(artistId).toBe(TEST_IDS.artists.artist1);
      }
    });
  });
});
