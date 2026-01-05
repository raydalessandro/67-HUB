/**
 * E2E Tests: Posts CRUD
 */

import { test, expect, S, TEST_IDS, createPost, getFutureDate } from './fixtures';

test.describe('Posts', () => {
  test.describe('Posts List', () => {
    test('staff can view posts list', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await expect(page.locator(S.POST.LIST)).toBeVisible();
    });

    test('staff sees all artists posts', async ({ staffPage: page }) => {
      await page.goto('/posts');

      const posts = page.locator(S.POST.CARD);
      const count = await posts.count();

      expect(count).toBeGreaterThan(0);
    });

    test('artist only sees their own posts', async ({ artistPage: page }) => {
      await page.goto('/posts');

      const posts = page.locator(S.POST.CARD);
      const count = await posts.count();

      for (let i = 0; i < count; i++) {
        const artistId = await posts.nth(i).getAttribute('data-artist-id');
        expect(artistId).toBe(TEST_IDS.artists.artist1);
      }
    });

    test('post cards show required info', async ({ staffPage: page }) => {
      await page.goto('/posts');

      const card = page.locator(S.POST.CARD).first();

      await expect(card.locator(S.POST.CARD_TITLE)).toBeVisible();
      await expect(card.locator(S.POST.CARD_STATUS)).toBeVisible();
      await expect(card.locator(S.POST.CARD_PLATFORM)).toBeVisible();
    });

    test('clicking post card opens detail', async ({ staffPage: page }) => {
      await page.goto('/posts');

      const card = page.locator(S.POST.CARD).first();
      const postId = await card.getAttribute('data-post-id');

      await card.click();

      await expect(page).toHaveURL(`/posts/${postId}`);
      await expect(page.locator(S.POST.DETAIL)).toBeVisible();
    });

    test('shows empty state when no posts match filters', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.selectOption(S.POST.FILTER_STATUS, 'published');
      await page.selectOption(S.POST.FILTER_ARTIST, TEST_IDS.artists.artist2);

      await page.waitForLoadState('networkidle');

      const postCount = await page.locator(S.POST.CARD).count();

      if (postCount === 0) {
        await expect(page.locator(S.POST.EMPTY_STATE)).toBeVisible();
      }
    });
  });

  test.describe('Post Filters', () => {
    test('can filter by status', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.selectOption(S.POST.FILTER_STATUS, 'draft');

      await page.waitForLoadState('networkidle');

      const posts = page.locator(S.POST.CARD);
      const count = await posts.count();

      for (let i = 0; i < count; i++) {
        const status = await posts.nth(i).getAttribute('data-status');
        expect(status).toBe('draft');
      }
    });

    test('can filter by artist', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.selectOption(S.POST.FILTER_ARTIST, TEST_IDS.artists.artist1);

      await page.waitForLoadState('networkidle');

      const posts = page.locator(S.POST.CARD);
      const count = await posts.count();

      for (let i = 0; i < count; i++) {
        const artistId = await posts.nth(i).getAttribute('data-artist-id');
        expect(artistId).toBe(TEST_IDS.artists.artist1);
      }
    });

    test('can filter by platform', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.selectOption(S.POST.FILTER_PLATFORM, 'instagram_feed');

      await page.waitForLoadState('networkidle');

      const posts = page.locator(S.POST.CARD);
      const count = await posts.count();

      for (let i = 0; i < count; i++) {
        const platform = await posts.nth(i).getAttribute('data-platform');
        expect(platform).toBe('instagram_feed');
      }
    });

    test('can clear all filters', async ({ staffPage: page }) => {
      await page.goto('/posts');

      await page.selectOption(S.POST.FILTER_STATUS, 'draft');
      await page.selectOption(S.POST.FILTER_ARTIST, TEST_IDS.artists.artist1);

      await page.click(S.POST.CLEAR_FILTERS);

      await expect(page.locator(S.POST.FILTER_STATUS)).toHaveValue('');
      await expect(page.locator(S.POST.FILTER_ARTIST)).toHaveValue('');
    });

    test('artist cannot see artist filter', async ({ artistPage: page }) => {
      await page.goto('/posts');

      await expect(page.locator(S.POST.FILTER_ARTIST)).not.toBeVisible();
    });
  });

  test.describe('Create Post', () => {
    test('staff can access create post page', async ({ staffPage: page }) => {
      await page.goto('/posts');
      await page.click(S.POST.NEW_POST);

      await expect(page).toHaveURL('/posts/new');
      await expect(page.locator(S.POST.FORM)).toBeVisible();
    });

    test('staff can create post with required fields', async ({ staffPage: page }) => {
      const postId = await createPost(page, {
        title: 'Test Post Creation',
        artistId: TEST_IDS.artists.artist1,
        platform: 'instagram_feed',
      });

      expect(postId).toBeTruthy();
      await expect(page.locator(S.POST.DETAIL)).toBeVisible();
      await expect(page.locator(S.POST.TITLE_DISPLAY)).toContainText('Test Post Creation');
    });

    test('new post has draft status', async ({ staffPage: page }) => {
      await createPost(page, {
        title: 'Draft Status Test',
        artistId: TEST_IDS.artists.artist1,
      });

      await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/draft|bozza/i);
    });

    test('shows validation errors for missing fields', async ({ staffPage: page }) => {
      await page.goto('/posts/new');
      await page.click(S.POST.SAVE_POST);

      await expect(page.locator(S.POST.ERROR_TITLE_REQUIRED)).toBeVisible();
    });

    test('shows error for past scheduled date', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.fill(S.POST.INPUT_TITLE, 'Past Date Test');
      await page.selectOption(S.POST.SELECT_ARTIST, TEST_IDS.artists.artist1);
      await page.selectOption(S.POST.SELECT_PLATFORM, 'instagram_feed');
      await page.fill(S.POST.INPUT_SCHEDULED, '2020-01-01T10:00');

      await page.click(S.POST.SAVE_POST);

      await expect(page.locator(S.POST.ERROR_SCHEDULED_PAST)).toBeVisible();
    });

    test('artist cannot create posts', async ({ artistPage: page }) => {
      await page.goto('/posts');

      await expect(page.locator(S.POST.NEW_POST)).not.toBeVisible();

      await page.goto('/posts/new');

      const url = page.url();
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !url.includes('/posts/new');

      expect(isForbidden || isRedirected).toBe(true);
    });
  });

  test.describe('Post Detail', () => {
    test('shows post detail page', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.DETAIL)).toBeVisible();
      await expect(page.locator(S.POST.TITLE_DISPLAY)).toBeVisible();
    });

    test('shows all post fields', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.TITLE_DISPLAY)).toBeVisible();
      await expect(page.locator(S.POST.STATUS_BADGE)).toBeVisible();
    });

    test('shows 404 for non-existent post', async ({ staffPage: page }) => {
      await page.goto('/posts/00000000-0000-0000-0000-000000000000');

      await expect(page.locator(S.COMMON.ERROR_NOT_FOUND)).toBeVisible();
    });
  });

  test.describe('Edit Post', () => {
    test('staff can edit draft post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.POST.FORM)).toBeVisible();
      await expect(page.locator(S.POST.INPUT_TITLE)).toBeEnabled();
    });

    test('can update post title', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);
      await page.click(S.POST.EDIT_POST);

      const newTitle = `Updated Title ${Date.now()}`;
      await page.fill(S.POST.INPUT_TITLE, newTitle);
      await page.click(S.POST.SAVE_POST);

      await expect(page.locator(S.POST.TITLE_DISPLAY)).toContainText(newTitle);
    });

    test('can cancel edit', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      const originalTitle = await page.locator(S.POST.TITLE_DISPLAY).textContent();

      await page.click(S.POST.EDIT_POST);
      await page.fill(S.POST.INPUT_TITLE, 'Should not save');
      await page.click(S.POST.CANCEL_EDIT);

      await expect(page.locator(S.POST.TITLE_DISPLAY)).toHaveText(originalTitle!);
    });
  });

  test.describe('Delete Post', () => {
    test('staff can delete draft post', async ({ staffPage: page }) => {
      const postId = await createPost(page, {
        title: 'Post To Delete',
        artistId: TEST_IDS.artists.artist1,
      });

      await page.goto(`/posts/${postId}`);
      await page.click(S.POST.DELETE_POST);
      await page.click(S.COMMON.CONFIRM_DELETE);

      await expect(page).toHaveURL('/posts');
    });

    test('delete requires confirmation', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);
      await page.click(S.POST.DELETE_POST);

      await expect(page.locator(S.COMMON.CONFIRM_DELETE)).toBeVisible();
    });
  });

  test.describe('Post Comments', () => {
    test('can view comments on post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      await expect(page.locator(S.POST.COMMENTS_SECTION)).toBeVisible();
    });

    test('staff can add comment', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const comment = `Test comment ${Date.now()}`;
      await page.fill(S.POST.COMMENT_INPUT, comment);
      await page.click(S.POST.SUBMIT_COMMENT);

      await expect(page.locator(S.POST.COMMENT).last()).toContainText(comment);
    });

    test('artist can add comment', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const comment = `Artist comment ${Date.now()}`;
      await page.fill(S.POST.COMMENT_INPUT, comment);
      await page.click(S.POST.SUBMIT_COMMENT);

      await expect(page.locator(S.POST.COMMENT).last()).toContainText(comment);
    });
  });
});
