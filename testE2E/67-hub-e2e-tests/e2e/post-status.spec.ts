/**
 * E2E Tests: Post Status Flow
 */

import {
  test,
  expect,
  S,
  TEST_IDS,
  createPost,
  sendForReview,
  approvePost,
  rejectPost,
  markAsPublished,
} from './fixtures';

test.describe('Post Status Flow', () => {
  test.describe('Draft Status', () => {
    test('new post starts as draft', async ({ staffPage: page }) => {
      const postId = await createPost(page, {
        title: 'Draft Test',
        artistId: TEST_IDS.artists.artist1,
      });

      await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/draft|bozza/i);
    });

    test('draft post shows send for review button', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.SEND_FOR_REVIEW)).toBeVisible();
    });

    test('draft post is editable by staff', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.POST.INPUT_TITLE)).toBeEnabled();
      await expect(page.locator(S.POST.INPUT_CAPTION)).toBeEnabled();
    });

    test('artist cannot see draft posts (not yet sent)', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      const isVisible = await page.locator(S.POST.DETAIL).isVisible();
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();

      expect(!isVisible || isForbidden).toBe(true);
    });
  });

  test.describe('Send for Review', () => {
    test('staff can send draft for review', async ({ staffPage: page }) => {
      const postId = await createPost(page, {
        title: 'Send for Review Test',
        artistId: TEST_IDS.artists.artist1,
      });

      await sendForReview(page);

      await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/in.*review/i);
    });

    test('after sending, shows waiting for approval', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/in.*review/i);
    });

    test('in_review post shows approve/reject for artist', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      await expect(page.locator(S.POST.APPROVE_POST)).toBeVisible();
      await expect(page.locator(S.POST.REJECT_POST)).toBeVisible();
    });

    test('staff cannot approve (only artist can)', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const approveBtn = page.locator(S.POST.APPROVE_POST);

      if (await approveBtn.isVisible()) {
        await expect(approveBtn).toBeDisabled();
      }
    });
  });

  test.describe('Approve Post', () => {
    test('artist can approve post', async ({ staffPage, artistPage }) => {
      const postId = await createPost(staffPage, {
        title: 'Approve Test',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      await artistPage.goto(`/posts/${postId}`);
      await approvePost(artistPage);

      await expect(artistPage.locator(S.POST.STATUS_BADGE)).toHaveText(/approv/i);
    });

    test('approved post shows publish button for staff', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.MARK_PUBLISHED)).toBeVisible();
    });

    test('artist cannot approve other artists posts', async ({ artist2Page: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const isVisible = await page.locator(S.POST.DETAIL).isVisible();
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();

      expect(!isVisible || isForbidden).toBe(true);
    });
  });

  test.describe('Reject Post', () => {
    test('artist can reject post with reason', async ({ staffPage, artistPage }) => {
      const postId = await createPost(staffPage, {
        title: 'Reject Test',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      await artistPage.goto(`/posts/${postId}`);
      await rejectPost(artistPage, 'Image quality is poor');

      await expect(artistPage.locator(S.POST.STATUS_BADGE)).toHaveText(/reject|rifiut/i);
    });

    test('rejection reason is required', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      await page.click(S.POST.REJECT_POST);

      const confirmBtn = page.locator(S.POST.CONFIRM_REJECT);
      await expect(confirmBtn).toBeDisabled();
    });

    test('rejected post shows reason', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      await expect(page.locator(S.POST.REJECTION_REASON)).toBeVisible();
    });

    test('rejected post can be edited by staff', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.POST.INPUT_TITLE)).toBeEnabled();
    });

    test('rejected post can be resent for review', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      await expect(page.locator(S.POST.SEND_FOR_REVIEW)).toBeVisible();
    });
  });

  test.describe('Publish Post', () => {
    test('staff can mark approved post as published', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await markAsPublished(page);

      await expect(page.locator(S.POST.STATUS_BADGE)).toHaveText(/pubbl/i);
    });

    test('published post cannot be edited', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      const editBtn = page.locator(S.POST.EDIT_POST);

      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeDisabled();
      }
    });

    test('only staff can mark as published', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.MARK_PUBLISHED)).not.toBeVisible();
    });
  });

  test.describe('Status Transitions', () => {
    test('complete flow: draft → review → approved → published', async ({
      staffPage,
      artistPage,
    }) => {
      // Create draft
      const postId = await createPost(staffPage, {
        title: 'Full Flow Test',
        artistId: TEST_IDS.artists.artist1,
      });
      await expect(staffPage.locator(S.POST.STATUS_BADGE)).toHaveText(/draft|bozza/i);

      // Send for review
      await sendForReview(staffPage);
      await expect(staffPage.locator(S.POST.STATUS_BADGE)).toHaveText(/in.*review/i);

      // Artist approves
      await artistPage.goto(`/posts/${postId}`);
      await approvePost(artistPage);
      await expect(artistPage.locator(S.POST.STATUS_BADGE)).toHaveText(/approv/i);

      // Staff publishes
      await staffPage.goto(`/posts/${postId}`);
      await markAsPublished(staffPage);
      await expect(staffPage.locator(S.POST.STATUS_BADGE)).toHaveText(/pubbl/i);
    });

    test('rejection flow: draft → review → rejected → edit → review → approved', async ({
      staffPage,
      artistPage,
    }) => {
      // Create and send for review
      const postId = await createPost(staffPage, {
        title: 'Rejection Flow Test',
        artistId: TEST_IDS.artists.artist1,
      });
      await sendForReview(staffPage);

      // Artist rejects
      await artistPage.goto(`/posts/${postId}`);
      await rejectPost(artistPage, 'Please improve the caption');

      // Staff edits and resends
      await staffPage.goto(`/posts/${postId}`);
      await staffPage.click(S.POST.EDIT_POST);
      await staffPage.fill(S.POST.INPUT_CAPTION, 'Improved caption');
      await staffPage.click(S.POST.SAVE_POST);
      await sendForReview(staffPage);

      // Artist approves
      await artistPage.goto(`/posts/${postId}`);
      await approvePost(artistPage);

      await expect(artistPage.locator(S.POST.STATUS_BADGE)).toHaveText(/approv/i);
    });
  });

  test.describe('Status History', () => {
    test('post has history tab', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.HISTORY_TAB)).toBeVisible();
    });

    test('history shows status changes', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await page.click(S.POST.HISTORY_TAB);

      const historyEntries = page.locator(S.POST.HISTORY_ENTRY);
      const count = await historyEntries.count();

      expect(count).toBeGreaterThan(0);
    });

    test('rejection creates system comment', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      const systemComment = page.locator(S.POST.SYSTEM_COMMENT);

      await expect(systemComment).toBeVisible();
    });
  });
});
