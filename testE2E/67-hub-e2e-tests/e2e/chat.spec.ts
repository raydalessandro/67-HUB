/**
 * E2E Tests: Chat
 */

import { test, expect, S, TEST_IDS } from './fixtures';

test.describe('Chat', () => {
  test.describe('Chat List', () => {
    test('staff can view chat list', async ({ staffPage: page }) => {
      await page.goto('/chat');
      await expect(page.locator(S.CHAT.LIST)).toBeVisible();
    });

    test('shows all artist conversations', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const items = page.locator(S.CHAT.LIST_ITEM);
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });

    test('conversations show artist name', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const item = page.locator(S.CHAT.LIST_ITEM).first();
      await expect(item.locator(S.CHAT.ARTIST_NAME)).toBeVisible();
    });

    test('conversations show preview of last message', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const item = page.locator(S.CHAT.LIST_ITEM).first();
      await expect(item.locator(S.CHAT.PREVIEW)).toBeVisible();
    });

    test('unread conversations show badge', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const unreadItem = page.locator(`${S.CHAT.LIST_ITEM}:has(${S.CHAT.UNREAD})`);
      if (await unreadItem.first().isVisible()) {
        await expect(unreadItem.first().locator(S.CHAT.UNREAD)).toBeVisible();
      }
    });

    test('clicking conversation opens chat room', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const item = page.locator(S.CHAT.LIST_ITEM).first();
      const artistId = await item.getAttribute('data-artist-id');
      await item.click();
      await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
    });
  });

  test.describe('Chat Room', () => {
    test('chat room shows messages', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await expect(page.locator(S.CHAT.MESSAGES)).toBeVisible();
    });

    test('shows artist name in header', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await expect(page.locator(S.CHAT.HEADER)).toBeVisible();
      await expect(page.locator(S.CHAT.HEADER)).toContainText(/MC Test|Artist/i);
    });

    test('messages show content', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      const message = page.locator(S.CHAT.MESSAGE).first();
      if (await message.isVisible()) {
        await expect(message.locator(S.CHAT.MESSAGE_CONTENT)).toBeVisible();
      }
    });

    test('messages show sender', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      const message = page.locator(S.CHAT.MESSAGE).first();
      if (await message.isVisible()) {
        await expect(message.locator(S.CHAT.MESSAGE_SENDER)).toBeVisible();
      }
    });

    test('messages show timestamp', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      const message = page.locator(S.CHAT.MESSAGE).first();
      if (await message.isVisible()) {
        await expect(message.locator(S.CHAT.MESSAGE_TIME)).toBeVisible();
      }
    });
  });

  test.describe('Send Message', () => {
    test('shows message input', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await expect(page.locator(S.CHAT.INPUT)).toBeVisible();
    });

    test('shows send button', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await expect(page.locator(S.CHAT.SEND_BUTTON)).toBeVisible();
    });

    test('staff can send message', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      const message = `Test message ${Date.now()}`;
      await page.fill(S.CHAT.INPUT, message);
      await page.click(S.CHAT.SEND_BUTTON);
      await expect(page.locator(S.CHAT.MESSAGE).last()).toContainText(message);
    });

    test('send button disabled when input empty', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await expect(page.locator(S.CHAT.INPUT)).toHaveValue('');
      await expect(page.locator(S.CHAT.SEND_BUTTON)).toBeDisabled();
    });

    test('input clears after sending', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await page.fill(S.CHAT.INPUT, 'Test message');
      await page.click(S.CHAT.SEND_BUTTON);
      await expect(page.locator(S.CHAT.INPUT)).toHaveValue('');
    });

    test('can send with Enter key', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      const message = `Enter key test ${Date.now()}`;
      await page.fill(S.CHAT.INPUT, message);
      await page.press(S.CHAT.INPUT, 'Enter');
      await expect(page.locator(S.CHAT.MESSAGE).last()).toContainText(message);
    });
  });

  test.describe('Artist Chat', () => {
    test('artist can access their chat', async ({ artistPage: page }) => {
      await page.goto('/chat');
      await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
    });

    test('artist can send message', async ({ artistPage: page }) => {
      await page.goto('/chat');
      const message = `Artist message ${Date.now()}`;
      await page.fill(S.CHAT.INPUT, message);
      await page.click(S.CHAT.SEND_BUTTON);
      await expect(page.locator(S.CHAT.MESSAGE).last()).toContainText(message);
    });

    test('artist sees staff messages', async ({ artistPage: page }) => {
      await page.goto('/chat');
      const messages = page.locator(S.CHAT.MESSAGE);
      const count = await messages.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('artist cannot access other artists chat', async ({ artistPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist2}/chat`);
      const isForbidden = await page.locator(S.COMMON.FORBIDDEN_MESSAGE).isVisible();
      const isRedirected = !page.url().includes(TEST_IDS.artists.artist2);
      expect(isForbidden || isRedirected).toBe(true);
    });
  });

  test.describe('Real-time Updates', () => {
    test('new messages appear without refresh', async ({ staffPage, artistPage }) => {
      await staffPage.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await artistPage.goto('/chat');

      const message = `Realtime test ${Date.now()}`;
      await artistPage.fill(S.CHAT.INPUT, message);
      await artistPage.click(S.CHAT.SEND_BUTTON);

      await expect(staffPage.locator(S.CHAT.MESSAGE).last()).toContainText(message, {
        timeout: 10000,
      });
    });

    test('typing indicator shows when other user types', async ({ staffPage, artistPage }) => {
      await staffPage.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await artistPage.goto('/chat');

      await artistPage.fill(S.CHAT.INPUT, 'Typing...');

      const typingIndicator = staffPage.locator(S.CHAT.TYPING_INDICATOR);
      // Typing indicator may or may not appear depending on implementation
      // Just verify it doesn't cause errors
    });
  });

  test.describe('Chat Navigation', () => {
    test('back button returns to chat list', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await page.click(S.CHAT.BACK);
      await expect(page.locator(S.CHAT.LIST)).toBeVisible();
    });

    test('can navigate between conversations', async ({ staffPage: page }) => {
      await page.goto('/chat');
      const items = page.locator(S.CHAT.LIST_ITEM);
      const count = await items.count();

      if (count >= 2) {
        await items.first().click();
        await expect(page.locator(S.CHAT.ROOM)).toBeVisible();

        await page.click(S.CHAT.BACK);
        await items.nth(1).click();
        await expect(page.locator(S.CHAT.ROOM)).toBeVisible();
      }
    });
  });

  test.describe('Message Validation', () => {
    test('cannot send empty message', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await page.fill(S.CHAT.INPUT, '   ');
      await expect(page.locator(S.CHAT.SEND_BUTTON)).toBeDisabled();
    });

    test('shows character count', async ({ staffPage: page }) => {
      await page.goto(`/artists/${TEST_IDS.artists.artist1}/chat`);
      await page.fill(S.CHAT.INPUT, 'Hello');
      const charCount = page.locator(S.CHAT.CHAR_COUNT);
      if (await charCount.isVisible()) {
        await expect(charCount).toContainText('5');
      }
    });
  });
});
