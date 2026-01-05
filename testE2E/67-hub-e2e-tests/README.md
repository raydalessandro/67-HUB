# 67 Hub - E2E Tests

End-to-end test suite for 67 Hub using Playwright.

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test -g "login"

# Debug mode
npm run test:debug
```

## Test Structure

```
e2e/
├── fixtures.ts          # Test utilities, helpers, custom fixtures
├── selectors.ts         # Centralized data-testid selectors
├── auth.spec.ts         # Authentication tests
├── posts.spec.ts        # Post CRUD tests
├── post-status.spec.ts  # Status flow tests
├── post-locking.spec.ts # Content locking tests
├── upload.spec.ts       # Media upload tests
├── calendar.spec.ts     # Calendar tests
├── chat.spec.ts         # Chat tests
├── notifications.spec.ts# Notification tests
├── dashboard.spec.ts    # Dashboard tests
├── artists.spec.ts      # Artist management tests
├── mobile.spec.ts       # Mobile/responsive tests
├── errors.spec.ts       # Error handling tests
└── fixtures/            # Test files (images, videos)
```

## Test Users

| Role    | Email               | Password        |
|---------|---------------------|-----------------|
| Admin   | admin@67hub.test    | testpassword123 |
| Manager | manager@67hub.test  | testpassword123 |
| Artist1 | artist1@67hub.test  | testpassword123 |
| Artist2 | artist2@67hub.test  | testpassword123 |

## Database Seeding

Before running tests, seed the database:

```bash
# Using Supabase CLI
supabase db reset
# Or run seed manually
psql -f supabase/seed.sql
```

## Selector Convention

All selectors use `data-testid` attributes. When adding new testable elements:

1. Add `data-testid="your-id"` to the component
2. Add the selector to `selectors.ts`
3. Use `S.CATEGORY.YOUR_ID` in tests

Example:
```tsx
// Component
<button data-testid="submit-form">Submit</button>

// selectors.ts
export const S = {
  FORM: {
    SUBMIT: '[data-testid="submit-form"]',
  }
}

// Test
await page.click(S.FORM.SUBMIT);
```

## Custom Fixtures

```typescript
import { test, expect, S, TEST_IDS } from './fixtures';

// staffPage - logged in as admin
test('staff can do something', async ({ staffPage }) => {
  // Already authenticated
});

// artistPage - logged in as artist1
test('artist can do something', async ({ artistPage }) => {
  // Already authenticated
});

// unauthenticatedPage - not logged in
test('redirect to login', async ({ unauthenticatedPage }) => {
  // Not authenticated
});
```

## Helper Functions

```typescript
// Login
await loginAs(page, TEST_USERS.admin);

// Create post
const postId = await createPost(page, {
  title: 'My Post',
  artistId: TEST_IDS.artists.artist1,
});

// Status actions
await sendForReview(page);
await approvePost(page);
await rejectPost(page, 'Reason');
await markAsPublished(page);

// Assertions
await expectToast(page, 'success', 'Saved');
```

## CI/CD

Tests run automatically on PR and merge to main.

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm test
```

## Reports

After running tests:

```bash
# View HTML report
npm run test:report
```

Reports are saved in `playwright-report/`.
