/**
 * E2E Tests: Artist Management
 */

import { test, expect, S, TEST_IDS, TEST_USERS } from './fixtures';

test.describe('Artists', () => {
  test.describe('Artists List', () => {
    test('staff can view artists list', async ({ staffPage: page }) => {
      await page.goto('/artists');
      await expect(page.locator(S.ARTIST.LIST)).toBeVisible();
    });

    test('shows all artists', async ({ staffPage: page }) => {
      await page.goto('/artists');
      const cards = page.locator(S.ARTIST.CARD);
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('artist cards show name', async ({ staffPage: page }) => {
      await page.goto('/artists');
      const card = page.locator(S.ARTIST.CARD).first();
      await expect(card.locator(S.ARTIST.NAME)).toBeVisible();
    });

    test('artist cards show color indicator', async ({ staffPage: page }) => {
      await page.goto('/artists');
      const card = page.locator(S.ARTIST.CARD).first();
      await expect(card.locator(S.ARTIST.COLOR)).toBeVisible();
    });

    test('label 67 shows badge', async ({ staffPage: page }) => {
      await page.goto('/artists');
      const labelCard = page.locator(`${S.ARTIST.CARD}[data-artist-id="${TEST_IDS.artists.label67}"]`);
      if (await labelCard.isVisible()) {
        await expect(labelCard.locator(S.ARTIST.LABEL_BADGE)).toBeVisible();
      }
    });

    test('can search artists', async ({ staffPage: page }) => {
      await page.goto('/artists');
      await page.fill(S.ARTIST.SEARCH, 'MC Test');
      await page.waitForLoadState('networkidle');
      const cards = page.locator(S.ARTIST.CARD);
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('clicking card opens artist detail', async ({ staffPage: page }) => {
      await page.goto('/artists');
      const card = page.locator(S.ARTIST.CARD).first();
      const artistId = await card.getAttribute('data-artist-id');
      await card.click();
      await expect(page).toHaveURL(`/artists/${artistId}`);
    });
  });

  test.describe('Artist Detail', () => {
    test('shows artist detail page', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.DETAIL)).toBeVisible();
    });

    test('shows artist name', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.NAME)).toContainText('MC Test');
    });

    test('shows artist stats', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.STATS)).toBeVisible();
    });

    test('shows total posts count', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.STAT_TOTAL_POSTS)).toBeVisible();
    });

    test('shows artist posts list', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.POSTS_LIST)).toBeVisible();
    });

    test('has link to open chat', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.OPEN_CHAT)).toBeVisible();
    });

    test('open chat navigates to chat', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.OPEN_CHAT);
      await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
    });
  });

  test.describe('Create Artist', () => {
    test('staff can access create artist page', async ({ staffPage: page }) => {
      await page.goto('/artists');
      await page.click(S.ARTIST.CREATE_ARTIST);
      await expect(page).toHaveURL('/artists/new');
    });

    test('shows artist form', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await expect(page.locator(S.ARTIST.FORM)).toBeVisible();
    });

    test('can create new artist', async ({ staffPage: page }) => {
      await page.goto('/artists/new');

      const uniqueName = `Test Artist ${Date.now()}`;
      const uniqueEmail = `test${Date.now()}@67hub.test`;

      await page.fill(S.ARTIST.INPUT_NAME, uniqueName);
      await page.fill(S.ARTIST.INPUT_EMAIL, uniqueEmail);
      await page.fill(S.ARTIST.INPUT_PASSWORD, 'SecurePassword123!');

      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page).toHaveURL(/\/artists\/[a-f0-9-]+/);
      await expect(page.locator(S.ARTIST.NAME)).toContainText(uniqueName);
    });

    test('shows validation errors for missing name', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await page.fill(S.ARTIST.INPUT_EMAIL, 'test@test.com');
      await page.fill(S.ARTIST.INPUT_PASSWORD, 'password123');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.ERROR_NAME_REQUIRED)).toBeVisible();
    });

    test('shows validation errors for missing email', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await page.fill(S.ARTIST.INPUT_NAME, 'Test Name');
      await page.fill(S.ARTIST.INPUT_PASSWORD, 'password123');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.ERROR_EMAIL_REQUIRED)).toBeVisible();
    });

    test('shows error for invalid email format', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await page.fill(S.ARTIST.INPUT_NAME, 'Test Name');
      await page.fill(S.ARTIST.INPUT_EMAIL, 'notanemail');
      await page.fill(S.ARTIST.INPUT_PASSWORD, 'password123');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.ERROR_EMAIL_INVALID)).toBeVisible();
    });

    test('shows error for weak password', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await page.fill(S.ARTIST.INPUT_NAME, 'Test Name');
      await page.fill(S.ARTIST.INPUT_EMAIL, 'test@test.com');
      await page.fill(S.ARTIST.INPUT_PASSWORD, '123');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.ERROR_PASSWORD_WEAK)).toBeVisible();
    });

    test('shows error for duplicate email', async ({ staffPage: page }) => {
      await page.goto('/artists/new');
      await page.fill(S.ARTIST.INPUT_NAME, 'Duplicate Test');
      await page.fill(S.ARTIST.INPUT_EMAIL, TEST_USERS.artist1.email);
      await page.fill(S.ARTIST.INPUT_PASSWORD, 'SecurePassword123!');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.ERROR_EMAIL_EXISTS)).toBeVisible();
    });
  });

  test.describe('Edit Artist', () => {
    test('can edit artist details', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.EDIT_ARTIST);

      await expect(page.locator(S.ARTIST.INPUT_NAME)).toBeEnabled();
    });

    test('can update artist name', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.EDIT_ARTIST);

      const newName = `MC Test Updated ${Date.now()}`;
      await page.fill(S.ARTIST.INPUT_NAME, newName);
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.NAME)).toContainText(newName);
    });

    test('can update artist bio', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.EDIT_ARTIST);

      await page.fill(S.ARTIST.INPUT_BIO, 'Updated bio text');
      await page.click(S.ARTIST.SAVE_ARTIST);

      await expect(page.locator(S.ARTIST.DETAIL)).toContainText('Updated bio text');
    });

    test('can update social links', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.EDIT_ARTIST);

      await page.fill(S.ARTIST.INPUT_INSTAGRAM, 'https://instagram.com/mctest');
      await page.fill(S.ARTIST.INPUT_SPOTIFY, 'https://open.spotify.com/artist/123');
      await page.click(S.ARTIST.SAVE_ARTIST);
    });

    test('can change artist color', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.EDIT_ARTIST);

      const colorInput = page.locator(S.ARTIST.COLOR_INPUT);
      await colorInput.fill('#ff5500');
      await page.click(S.ARTIST.SAVE_ARTIST);
    });
  });

  test.describe('Artist Credentials', () => {
    test('shows credentials shared status', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await expect(page.locator(S.ARTIST.CREDENTIALS_SHARED)).toBeVisible();
    });

    test('can reset artist password', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.RESET_PASSWORD);
      await expect(page.locator(S.ARTIST.RESET_PASSWORD_MODAL)).toBeVisible();
    });

    test('reset password requires confirmation', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.RESET_PASSWORD);
      await page.fill(S.ARTIST.NEW_PASSWORD, 'NewSecurePassword123!');
      await page.click(S.ARTIST.CONFIRM_RESET);

      // Should show success or confirmation
    });

    test('shows password requirements', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}`);
      await page.click(S.ARTIST.RESET_PASSWORD);
      await expect(page.locator(S.ARTIST.PASSWORD_REQUIREMENTS)).toBeVisible();
    });
  });

  test.describe('Delete Artist', () => {
    test('shows delete button', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist2}`);
      await expect(page.locator(S.ARTIST.DELETE_ARTIST)).toBeVisible();
    });

    test('delete requires confirmation', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist2}`);
      await page.click(S.ARTIST.DELETE_ARTIST);
      await expect(page.locator(S.ARTIST.CONFIRM_DELETE_MODAL)).toBeVisible();
    });

    test('can cancel delete', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist2}`);
      await page.click(S.ARTIST.DELETE_ARTIST);
      await page.click(S.ARTIST.CANCEL_DELETE);
      await expect(page.locator(S.ARTIST.DETAIL)).toBeVisible();
    });
  });

  test.describe('Artist Access Restrictions', () => {
    test('artist cannot access artists list', async ({ artistPage: page }) => {
      await page.goto('/artists');
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !page.url().includes('/artists');
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('artist cannot create new artist', async ({ artistPage: page }) => {
      await page.goto('/artists/new');
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !page.url().includes('/artists/new');
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('artist cannot view other artists', async ({ artistPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist2}`);
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !page.url().includes(TEST_IDS.artists.artist2);
      expect(isForbidden || isRedirected).toBe(true);
    });
  });
});
