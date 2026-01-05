/**
 * E2E Tests: Post Content Locking
 */

import { test, expect, S, TEST_IDS } from './fixtures';

test.describe('Post Content Locking', () => {
  test.describe('Approved Post Locking', () => {
    test('approved post shows locked indicator', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.LOCKED_INDICATOR)).toBeVisible();
    });

    test('approved post edit button is disabled', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const editBtn = page.locator(S.POST.EDIT_POST);

      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeDisabled();
      }
    });

    test('approved post shows locked message', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.LOCKED_MESSAGE)).toBeVisible();
      await expect(page.locator(S.POST.LOCKED_MESSAGE)).toContainText(/approv|bloccato|locked/i);
    });

    test('approved post cannot change artist', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const artistSelect = page.locator(S.POST.SELECT_ARTIST);

      if (await artistSelect.isVisible()) {
        await expect(artistSelect).toBeDisabled();
      }
    });

    test('approved post cannot change platform', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const platformSelect = page.locator(S.POST.SELECT_PLATFORM);

      if (await platformSelect.isVisible()) {
        await expect(platformSelect).toBeDisabled();
      }
    });

    test('approved post cannot change schedule', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const scheduleInput = page.locator(S.POST.INPUT_SCHEDULED);

      if (await scheduleInput.isVisible()) {
        await expect(scheduleInput).toBeDisabled();
      }
    });
  });

  test.describe('Published Post Locking', () => {
    test('published post shows locked indicator', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      await expect(page.locator(S.POST.LOCKED_INDICATOR)).toBeVisible();
    });

    test('published post cannot be edited', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      const editBtn = page.locator(S.POST.EDIT_POST);

      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeDisabled();
      }
    });

    test('published post cannot be deleted', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      const deleteBtn = page.locator(S.POST.DELETE_POST);

      if (await deleteBtn.isVisible()) {
        await expect(deleteBtn).toBeDisabled();
      }
    });

    test('published post shows published message', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      await expect(page.locator(S.POST.LOCKED_MESSAGE)).toContainText(/pubbl|published/i);
    });
  });

  test.describe('Editable States', () => {
    test('draft post is fully editable', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.POST.INPUT_TITLE)).toBeEnabled();
      await expect(page.locator(S.POST.INPUT_CAPTION)).toBeEnabled();
      await expect(page.locator(S.POST.SELECT_PLATFORM)).toBeEnabled();
      await expect(page.locator(S.POST.INPUT_SCHEDULED)).toBeEnabled();
    });

    test('draft post does not show locked indicator', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);

      await expect(page.locator(S.POST.LOCKED_INDICATOR)).not.toBeVisible();
    });

    test('in_review post is not editable by staff', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const editBtn = page.locator(S.POST.EDIT_POST);

      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeDisabled();
      }
    });

    test('rejected post is editable', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.POST.INPUT_TITLE)).toBeEnabled();
    });

    test('rejected post does not show locked indicator', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.rejected}`);

      await expect(page.locator(S.POST.LOCKED_INDICATOR)).not.toBeVisible();
    });
  });

  test.describe('Comments Always Available', () => {
    test('can add comments on approved post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      await expect(page.locator(S.POST.COMMENT_INPUT)).toBeEnabled();
    });

    test('can add comments on published post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.published}`);

      await expect(page.locator(S.POST.COMMENT_INPUT)).toBeEnabled();
    });

    test('artist can comment on locked post', async ({ artistPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const comment = `Comment on locked ${Date.now()}`;
      await page.fill(S.POST.COMMENT_INPUT, comment);
      await page.click(S.POST.SUBMIT_COMMENT);

      await expect(page.locator(S.POST.COMMENT).last()).toContainText(comment);
    });
  });

  test.describe('Media Locking', () => {
    test('cannot add media to approved post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const uploadBtn = page.locator(S.MEDIA.UPLOAD_BUTTON);

      if (await uploadBtn.isVisible()) {
        await expect(uploadBtn).toBeDisabled();
      }
    });

    test('cannot remove media from approved post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const removeBtn = page.locator(S.MEDIA.REMOVE_MEDIA);

      if (await removeBtn.isVisible()) {
        await expect(removeBtn).toBeDisabled();
      }
    });

    test('cannot reorder media on approved post', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const reorderHandle = page.locator(S.MEDIA.REORDER_HANDLE);

      if (await reorderHandle.isVisible()) {
        const cursor = await reorderHandle.evaluate(
          (el) => window.getComputedStyle(el).cursor
        );
        expect(cursor).toBe('not-allowed');
      }
    });
  });
});
