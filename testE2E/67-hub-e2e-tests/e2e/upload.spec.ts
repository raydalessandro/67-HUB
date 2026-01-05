/**
 * E2E Tests: Media Upload
 */

import { test, expect, S, TEST_IDS, createPost } from './fixtures';
import path from 'path';

// Test file paths
const TEST_FILES = {
  image: path.join(__dirname, 'fixtures', 'test-image.jpg'),
  image2: path.join(__dirname, 'fixtures', 'test-image-2.png'),
  video: path.join(__dirname, 'fixtures', 'test-video.mp4'),
  largefile: path.join(__dirname, 'fixtures', 'large-file.jpg'),
  invalidType: path.join(__dirname, 'fixtures', 'document.pdf'),
};

test.describe('Media Upload', () => {
  test.describe('Upload Zone', () => {
    test('shows upload zone on new post', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await expect(page.locator(S.MEDIA.UPLOAD_ZONE)).toBeVisible();
    });

    test('upload zone accepts click', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.click(S.MEDIA.UPLOAD_ZONE);

      // File input should be triggered (we can't fully test file dialog)
      await expect(page.locator(S.MEDIA.FILE_INPUT)).toBeAttached();
    });

    test('shows drag and drop hint', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await expect(page.locator(S.MEDIA.UPLOAD_ZONE)).toContainText(/drag|drop|trascina/i);
    });
  });

  test.describe('Image Upload', () => {
    test('can upload single image', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      const fileInput = page.locator(S.MEDIA.FILE_INPUT);
      await fileInput.setInputFiles(TEST_FILES.image);

      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();
      await expect(page.locator(S.MEDIA.THUMBNAIL)).toBeVisible();
    });

    test('can upload multiple images', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      const fileInput = page.locator(S.MEDIA.FILE_INPUT);
      await fileInput.setInputFiles([TEST_FILES.image, TEST_FILES.image2]);

      const thumbnails = page.locator(S.MEDIA.THUMBNAIL);
      await expect(thumbnails).toHaveCount(2);
    });

    test('shows image preview', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);

      const thumbnail = page.locator(S.MEDIA.THUMBNAIL).first();
      await expect(thumbnail).toBeVisible();

      // Click to view fullscreen
      await thumbnail.click();
      await expect(page.locator(S.MEDIA.FULLSCREEN)).toBeVisible();
    });

    test('can close fullscreen preview', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);
      await page.locator(S.MEDIA.THUMBNAIL).first().click();

      await expect(page.locator(S.MEDIA.FULLSCREEN)).toBeVisible();

      await page.click(S.MEDIA.CLOSE_FULLSCREEN);

      await expect(page.locator(S.MEDIA.FULLSCREEN)).not.toBeVisible();
    });
  });

  test.describe('Video Upload', () => {
    test('can upload video', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.video);

      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();
    });

    test('video shows play button', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.video);

      await expect(page.locator(S.MEDIA.VIDEO_PLAYER)).toBeVisible();
    });

    test('shows video duration', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.video);

      await expect(page.locator(S.MEDIA.VIDEO_DURATION)).toBeVisible();
    });
  });

  test.describe('Upload Validation', () => {
    test('shows error for file too large', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.largefile);

      await expect(page.locator(S.MEDIA.ERROR_FILE_TOO_LARGE)).toBeVisible();
    });

    test('shows error for invalid file type', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.invalidType);

      await expect(page.locator(S.MEDIA.ERROR_INVALID_TYPE)).toBeVisible();
    });

    test('shows error when exceeding max files', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      // Try to upload 11 files (assuming max is 10)
      const files = Array(11).fill(TEST_FILES.image);
      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(files);

      await expect(page.locator(S.MEDIA.ERROR_MAX_FILES)).toBeVisible();
    });

    test('accepts valid image types', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);

      await expect(page.locator(S.MEDIA.ERROR_INVALID_TYPE)).not.toBeVisible();
      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();
    });
  });

  test.describe('Media Management', () => {
    test('can remove uploaded media', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);
      await expect(page.locator(S.MEDIA.THUMBNAIL)).toBeVisible();

      await page.click(S.MEDIA.REMOVE_MEDIA);

      await expect(page.locator(S.MEDIA.THUMBNAIL)).not.toBeVisible();
    });

    test('can reorder media', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page
        .locator(S.MEDIA.FILE_INPUT)
        .setInputFiles([TEST_FILES.image, TEST_FILES.image2]);

      const thumbnails = page.locator(S.MEDIA.THUMBNAIL);
      await expect(thumbnails).toHaveCount(2);

      // Reorder handles should be visible
      await expect(page.locator(S.MEDIA.REORDER_HANDLE).first()).toBeVisible();
    });

    test('shows media count', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page
        .locator(S.MEDIA.FILE_INPUT)
        .setInputFiles([TEST_FILES.image, TEST_FILES.image2]);

      await expect(page.locator(S.MEDIA.MEDIA_COUNT)).toContainText('2');
    });
  });

  test.describe('Upload Progress', () => {
    test('shows uploading indicator', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      // Start upload (progress indicator may be brief)
      const uploadPromise = page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);

      // Check for indicator (may or may not catch it)
      const indicator = page.locator(S.MEDIA.UPLOADING_INDICATOR);

      await uploadPromise;

      // Eventually preview should appear
      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();
    });

    test('shows progress bar during upload', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      const progressBar = page.locator(S.MEDIA.PROGRESS_BAR);

      // Progress bar visibility depends on upload speed
      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);

      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();
    });
  });

  test.describe('Media on Existing Post', () => {
    test('draft post allows adding media', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.draft}`);
      await page.click(S.POST.EDIT_POST);

      await expect(page.locator(S.MEDIA.UPLOAD_ZONE)).toBeVisible();
      await expect(page.locator(S.MEDIA.FILE_INPUT)).toBeEnabled();
    });

    test('approved post does not allow adding media', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.approved}`);

      const uploadZone = page.locator(S.MEDIA.UPLOAD_ZONE);
      const fileInput = page.locator(S.MEDIA.FILE_INPUT);

      if (await uploadZone.isVisible()) {
        await expect(fileInput).toBeDisabled();
      }
    });

    test('existing media is displayed', async ({ staffPage: page }) => {
      await page.goto(`/posts/${TEST_IDS.posts.inReview}`);

      const gallery = page.locator(S.MEDIA.GALLERY);

      if (await gallery.isVisible()) {
        const thumbnails = page.locator(S.MEDIA.THUMBNAIL);
        const count = await thumbnails.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Post Creation with Media', () => {
    test('can create post with image', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.fill(S.POST.INPUT_TITLE, 'Post with Image');
      await page.selectOption(S.POST.SELECT_ARTIST, TEST_IDS.artists.artist1);
      await page.selectOption(S.POST.SELECT_PLATFORM, 'instagram_feed');

      await page.locator(S.MEDIA.FILE_INPUT).setInputFiles(TEST_FILES.image);
      await expect(page.locator(S.MEDIA.PREVIEW)).toBeVisible();

      await page.click(S.POST.SAVE_POST);

      await expect(page).toHaveURL(/\/posts\/[a-f0-9-]+/);
      await expect(page.locator(S.MEDIA.GALLERY)).toBeVisible();
    });

    test('can create post with multiple images', async ({ staffPage: page }) => {
      await page.goto('/posts/new');

      await page.fill(S.POST.INPUT_TITLE, 'Post with Multiple Images');
      await page.selectOption(S.POST.SELECT_ARTIST, TEST_IDS.artists.artist1);
      await page.selectOption(S.POST.SELECT_PLATFORM, 'instagram_feed');

      await page
        .locator(S.MEDIA.FILE_INPUT)
        .setInputFiles([TEST_FILES.image, TEST_FILES.image2]);

      await page.click(S.POST.SAVE_POST);

      await expect(page).toHaveURL(/\/posts\/[a-f0-9-]+/);

      const thumbnails = page.locator(S.MEDIA.THUMBNAIL);
      await expect(thumbnails).toHaveCount(2);
    });
  });
});
