/**
 * E2E Test Fixtures and Helpers
 */

import { test as base, expect, Page } from '@playwright/test';
import { S } from './selectors';

// =============================================================================
// TEST IDS - Fixed UUIDs for seeded test data
// =============================================================================

export const TEST_IDS = {
  users: {
    admin: '00000000-0000-0000-0000-000000000001',
    manager: '00000000-0000-0000-0000-000000000002',
    artist1: '00000000-0000-0000-0000-000000000003',
    artist2: '00000000-0000-0000-0000-000000000004',
  },
  artists: {
    artist1: '11111111-1111-1111-1111-111111111111',
    artist2: '22222222-2222-2222-2222-222222222222',
    label67: '67676767-6767-6767-6767-676767676767',
  },
  posts: {
    draft: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    inReview: 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
    approved: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    rejected: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    published: 'pppppppp-pppp-pppp-pppp-pppppppppppp',
  },
  conversations: {
    artist1: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  },
};

// =============================================================================
// TEST USERS
// =============================================================================

export const TEST_USERS = {
  admin: {
    email: 'admin@67hub.test',
    password: 'testpassword123',
    displayName: 'Test Admin',
    role: 'admin' as const,
  },
  manager: {
    email: 'manager@67hub.test',
    password: 'testpassword123',
    displayName: 'Test Manager',
    role: 'manager' as const,
  },
  artist1: {
    email: 'artist1@67hub.test',
    password: 'testpassword123',
    displayName: 'Test Artist 1',
    artistName: 'MC Test',
    role: 'artist' as const,
  },
  artist2: {
    email: 'artist2@67hub.test',
    password: 'testpassword123',
    displayName: 'Test Artist 2',
    artistName: 'DJ Sample',
    role: 'artist' as const,
  },
};

// =============================================================================
// DATE HELPERS
// =============================================================================

/**
 * Get a future date (avoids midnight edge cases)
 */
export function getFutureDate(hoursFromNow: number = 25): string {
  const future = new Date();
  future.setHours(future.getHours() + hoursFromNow);
  future.setMinutes(0, 0, 0);
  return future.toISOString().slice(0, 16);
}

/**
 * Get date with day offset
 */
export function getDateOffset(daysFromNow: number, hour: number = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

/** @deprecated Use getFutureDate() */
export function getTomorrowDate(): string {
  return getFutureDate(25);
}

// =============================================================================
// AUTH HELPERS
// =============================================================================

export async function loginAs(
  page: Page,
  user: { email: string; password: string }
): Promise<void> {
  await page.goto('/login');
  await page.fill(S.AUTH.EMAIL_INPUT, user.email);
  await page.fill(S.AUTH.PASSWORD_INPUT, user.password);
  await page.click(S.AUTH.LOGIN_BUTTON);
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

export async function logout(page: Page): Promise<void> {
  await page.click(S.AUTH.USER_MENU);
  await page.click(S.AUTH.LOGOUT_BUTTON);
  await page.waitForURL('/login');
}

// =============================================================================
// POST HELPERS
// =============================================================================

export async function createPost(
  page: Page,
  options: {
    title: string;
    artistId?: string;
    platform?: string;
    caption?: string;
    hashtags?: string;
    scheduledAt?: string;
  }
): Promise<string> {
  await page.goto('/posts/new');

  await page.fill(S.POST.INPUT_TITLE, options.title);

  if (options.artistId) {
    await page.selectOption(S.POST.SELECT_ARTIST, options.artistId);
  }

  await page.selectOption(
    S.POST.SELECT_PLATFORM,
    options.platform || 'instagram_feed'
  );

  if (options.caption) {
    await page.fill(S.POST.INPUT_CAPTION, options.caption);
  }

  if (options.hashtags) {
    await page.fill(S.POST.INPUT_HASHTAGS, options.hashtags);
  }

  const scheduledAt = options.scheduledAt || getFutureDate();
  await page.fill(S.POST.INPUT_SCHEDULED, scheduledAt);

  await page.click(S.POST.SAVE_POST);

  await page.waitForURL(/\/posts\/[a-f0-9-]+/);
  const url = page.url();
  const postId = url.split('/').pop() || '';

  return postId;
}

export async function sendForReview(page: Page): Promise<void> {
  await page.click(S.POST.SEND_FOR_REVIEW);

  const confirmBtn = page.locator(S.COMMON.CONFIRM_ACTION);
  if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmBtn.click();
  }

  await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/in.*review/i, {
    timeout: 5000,
  });
}

export async function approvePost(page: Page): Promise<void> {
  await page.click(S.POST.APPROVE_POST);

  const confirmBtn = page.locator(S.COMMON.CONFIRM_ACTION);
  if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmBtn.click();
  }

  await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/approv/i, {
    timeout: 5000,
  });
}

export async function rejectPost(page: Page, reason: string): Promise<void> {
  await page.click(S.POST.REJECT_POST);
  await page.fill(S.POST.REJECT_REASON_INPUT, reason);
  await page.click(S.POST.CONFIRM_REJECT);

  await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/rifiut|reject/i, {
    timeout: 5000,
  });
}

export async function markAsPublished(page: Page): Promise<void> {
  await page.click(S.POST.MARK_PUBLISHED);

  const confirmBtn = page.locator(S.COMMON.CONFIRM_ACTION);
  if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmBtn.click();
  }

  await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/pubbl/i, {
    timeout: 5000,
  });
}

export async function deletePost(page: Page, postId: string): Promise<void> {
  await page.goto(`/posts/${postId}`);
  await page.click(S.POST.DELETE_POST);
  await page.click(S.COMMON.CONFIRM_DELETE);
  await page.waitForURL('/posts');
}

// =============================================================================
// NAVIGATION HELPERS
// =============================================================================

export async function goToPost(page: Page, postId: string): Promise<void> {
  await page.goto(`/posts/${postId}`);
  await expect(page.locator(S.POST.DETAIL)).toBeVisible();
}

export async function goToChat(page: Page, artistId: string): Promise<void> {
  await page.goto(`/artists/${artistId}/chat`);
  await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
}

// =============================================================================
// UI HELPERS
// =============================================================================

export async function expectToast(
  page: Page,
  type: 'success' | 'error' | 'info',
  textContains?: string
): Promise<void> {
  const selector =
    type === 'success'
      ? S.COMMON.TOAST_SUCCESS
      : type === 'error'
        ? S.COMMON.TOAST_ERROR
        : S.COMMON.TOAST_INFO;

  const toast = page.locator(selector);
  await expect(toast).toBeVisible({ timeout: 5000 });

  if (textContains) {
    await expect(toast).toContainText(textContains);
  }
}

export async function getNotificationCount(page: Page): Promise<number> {
  const badge = page.locator(S.NAV.NOTIFICATION_BADGE);

  if (await badge.isVisible()) {
    const text = await badge.textContent();
    return parseInt(text || '0', 10);
  }

  return 0;
}

export async function uploadMedia(page: Page, filePath: string): Promise<void> {
  const fileInput = page.locator(S.MEDIA.FILE_INPUT);
  await fileInput.setInputFiles(filePath);
  await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible({ timeout: 10000 });
}

// =============================================================================
// CUSTOM FIXTURES
// =============================================================================

export const test = base.extend<{
  staffPage: Page;
  artistPage: Page;
  artist2Page: Page;
  unauthenticatedPage: Page;
}>({
  staffPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.admin);
    await use(page);
    await context.close();
  },

  artistPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.artist1);
    await use(page);
    await context.close();
  },

  artist2Page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.artist2);
    await use(page);
    await context.close();
  },

  unauthenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
export { S } from './selectors';
