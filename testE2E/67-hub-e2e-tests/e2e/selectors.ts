/**
 * Centralized Selectors for E2E Tests
 * 
 * All data-testid selectors in one place.
 * When you change a data-testid in the app, update it here ONLY.
 */

export const S = {
  // =========================================================================
  // AUTH
  // =========================================================================
  AUTH: {
    LOGIN_FORM: '[data-testid="login-form"]',
    EMAIL_INPUT: '[data-testid="email-input"]',
    PASSWORD_INPUT: '[data-testid="password-input"]',
    LOGIN_BUTTON: '[data-testid="login-button"]',
    LOGOUT_BUTTON: '[data-testid="logout-button"]',
    USER_MENU: '[data-testid="user-menu"]',
    USER_NAME: '[data-testid="user-name"]',
    USER_ROLE: '[data-testid="user-role"]',
    ERROR_EMAIL_REQUIRED: '[data-testid="error-email-required"]',
    ERROR_PASSWORD_REQUIRED: '[data-testid="error-password-required"]',
    ERROR_INVALID_CREDENTIALS: '[data-testid="error-invalid-credentials"]',
    ERROR_EMAIL_INVALID: '[data-testid="error-email-invalid"]',
  },

  // =========================================================================
  // NAVIGATION
  // =========================================================================
  NAV: {
    SIDEBAR: '[data-testid="sidebar"]',
    MOBILE_NAV: '[data-testid="mobile-nav"]',
    HAMBURGER_MENU: '[data-testid="hamburger-menu"]',
    MOBILE_MENU: '[data-testid="mobile-menu"]',
    DASHBOARD: '[data-testid="nav-dashboard"]',
    POSTS: '[data-testid="nav-posts"]',
    CALENDAR: '[data-testid="nav-calendar"]',
    ARTISTS: '[data-testid="nav-artists"]',
    CHAT: '[data-testid="nav-chat"]',
    NOTIFICATIONS: '[data-testid="nav-notifications"]',
    SETTINGS: '[data-testid="nav-settings"]',
    MENU_ARTISTS: '[data-testid="menu-artists"]',
    MENU_SETTINGS: '[data-testid="menu-settings"]',
    NOTIFICATION_BADGE: '[data-testid="notification-badge"]',
    NOTIFICATION_BELL: '[data-testid="notification-bell"]',
    NOTIFICATION_DROPDOWN: '[data-testid="notification-dropdown"]',
    VIEW_ALL_NOTIFICATIONS: '[data-testid="view-all-notifications"]',
  },

  // =========================================================================
  // DASHBOARD
  // =========================================================================
  DASHBOARD: {
    STAFF_DASHBOARD: '[data-testid="staff-dashboard"]',
    ARTIST_DASHBOARD: '[data-testid="artist-dashboard"]',
    WELCOME_MESSAGE: '[data-testid="welcome-message"]',
    QUICK_STATS: '[data-testid="quick-stats"]',
    STAT_POSTS_TODAY: '[data-testid="stat-posts-today"]',
    STAT_PENDING: '[data-testid="stat-pending"]',
    STAT_PUBLISHED_WEEK: '[data-testid="stat-published-week"]',
    TODAY_POSTS: '[data-testid="today-posts"]',
    TODAY_POSTS_EMPTY: '[data-testid="today-posts-empty"]',
    PENDING_APPROVALS: '[data-testid="pending-approvals"]',
    PENDING_MY_APPROVAL: '[data-testid="pending-my-approval"]',
    PENDING_COUNT: '[data-testid="pending-count"]',
    RECENT_PUBLISHED: '[data-testid="recent-published"]',
    MINI_CALENDAR: '[data-testid="mini-calendar"]',
    MINI_CALENDAR_HEADER: '[data-testid="mini-calendar-header"]',
    DAY_HAS_POSTS: '[data-testid="day-has-posts"]',
    DAY_POSTS_DETAIL: '[data-testid="day-posts-detail"]',
    RECENT_ACTIVITY: '[data-testid="recent-activity"]',
    ACTIVITY_ITEM: '[data-testid="activity-item"]',
    ACTIVITY_TIME: '[data-testid="activity-time"]',
    QUICK_NEW_POST: '[data-testid="quick-new-post"]',
    VIEW_ALL_POSTS: '[data-testid="view-all-posts"]',
    OPEN_CHAT: '[data-testid="open-chat"]',
    REFRESH_DASHBOARD: '[data-testid="refresh-dashboard"]',
    PENDING_SINCE: '[data-testid="pending-since"]',
  },

  // =========================================================================
  // POSTS
  // =========================================================================
  POST: {
    LIST: '[data-testid="posts-list"]',
    CARD: '[data-testid="post-card"]',
    EMPTY_STATE: '[data-testid="empty-state"]',
    FILTER_TOGGLE: '[data-testid="filter-toggle"]',
    FILTER_STATUS: '[data-testid="filter-status"]',
    FILTER_ARTIST: '[data-testid="filter-artist"]',
    FILTER_PLATFORM: '[data-testid="filter-platform"]',
    FILTER_DATE_FROM: '[data-testid="filter-date-from"]',
    FILTER_DATE_TO: '[data-testid="filter-date-to"]',
    CLEAR_FILTERS: '[data-testid="clear-filters"]',
    SEARCH_INPUT: '[data-testid="search-input"]',
    CARD_TITLE: '[data-testid="post-title"]',
    CARD_ARTIST: '[data-testid="post-artist-name"]',
    CARD_STATUS: '[data-testid="post-status"]',
    CARD_PLATFORM: '[data-testid="post-platform"]',
    CARD_DATE: '[data-testid="post-date"]',
    CARD_THUMBNAIL: '[data-testid="post-thumbnail"]',
    DETAIL: '[data-testid="post-detail"]',
    TITLE_DISPLAY: '[data-testid="post-title-display"]',
    CAPTION_DISPLAY: '[data-testid="post-caption-display"]',
    HASHTAGS_DISPLAY: '[data-testid="post-hashtags-display"]',
    STATUS_BADGE: '[data-testid="post-status"]',
    REJECTION_REASON: '[data-testid="rejection-reason"]',
    BACK_BUTTON: '[data-testid="back-button"]',
    FORM: '[data-testid="post-form"]',
    INPUT_TITLE: '[data-testid="post-title"]',
    INPUT_CAPTION: '[data-testid="post-caption"]',
    INPUT_HASHTAGS: '[data-testid="post-hashtags"]',
    SELECT_ARTIST: '[data-testid="post-artist"]',
    SELECT_PLATFORM: '[data-testid="post-platform"]',
    INPUT_SCHEDULED: '[data-testid="post-scheduled"]',
    ERROR_TITLE_REQUIRED: '[data-testid="error-title-required"]',
    ERROR_ARTIST_REQUIRED: '[data-testid="error-artist-required"]',
    ERROR_PLATFORM_REQUIRED: '[data-testid="error-platform-required"]',
    ERROR_SCHEDULED_REQUIRED: '[data-testid="error-scheduled-required"]',
    ERROR_SCHEDULED_PAST: '[data-testid="error-scheduled-past"]',
    NEW_POST: '[data-testid="new-post"]',
    EDIT_POST: '[data-testid="edit-post"]',
    SAVE_POST: '[data-testid="save-post"]',
    DELETE_POST: '[data-testid="delete-post"]',
    CANCEL_EDIT: '[data-testid="cancel-edit"]',
    SEND_FOR_REVIEW: '[data-testid="send-for-review"]',
    APPROVE_POST: '[data-testid="approve-post"]',
    REJECT_POST: '[data-testid="reject-post"]',
    MARK_PUBLISHED: '[data-testid="mark-published"]',
    REVERT_TO_DRAFT: '[data-testid="revert-to-draft"]',
    REJECT_MODAL: '[data-testid="reject-modal"]',
    REJECT_REASON_INPUT: '[data-testid="reject-reason-input"]',
    CONFIRM_REJECT: '[data-testid="confirm-reject"]',
    CANCEL_REJECT: '[data-testid="cancel-reject"]',
    COMMENTS_SECTION: '[data-testid="comments-section"]',
    COMMENT: '[data-testid="post-comment"]',
    COMMENT_INPUT: '[data-testid="comment-input"]',
    SUBMIT_COMMENT: '[data-testid="submit-comment"]',
    SYSTEM_COMMENT: '[data-testid="system-comment"]',
    HISTORY_TAB: '[data-testid="history-tab"]',
    HISTORY_LIST: '[data-testid="history-list"]',
    HISTORY_ENTRY: '[data-testid="history-entry"]',
    LOCKED_INDICATOR: '[data-testid="locked-indicator"]',
    LOCKED_MESSAGE: '[data-testid="locked-message"]',
    STATUS_BADGE_DRAFT: '[data-testid="status-draft"]',
    STATUS_BADGE_IN_REVIEW: '[data-testid="status-in-review"]',
    STATUS_BADGE_APPROVED: '[data-testid="status-approved"]',
    STATUS_BADGE_REJECTED: '[data-testid="status-rejected"]',
    STATUS_BADGE_PUBLISHED: '[data-testid="status-published"]',
  },

  // =========================================================================
  // MEDIA UPLOAD
  // =========================================================================
  MEDIA: {
    UPLOAD_ZONE: '[data-testid="media-upload-zone"]',
    UPLOAD_BUTTON: '[data-testid="media-upload"]',
    FILE_INPUT: '[data-testid="file-input"]',
    GALLERY: '[data-testid="media-gallery"]',
    THUMBNAIL: '[data-testid="media-thumbnail"]',
    PREVIEW: '[data-testid="media-preview"]',
    FULLSCREEN: '[data-testid="media-fullscreen"]',
    CLOSE_FULLSCREEN: '[data-testid="close-fullscreen"]',
    REMOVE_MEDIA: '[data-testid="remove-media"]',
    REORDER_HANDLE: '[data-testid="reorder-handle"]',
    UPLOADING_INDICATOR: '[data-testid="uploading-indicator"]',
    PROGRESS_BAR: '[data-testid="upload-progress"]',
    ERROR_FILE_TOO_LARGE: '[data-testid="error-file-too-large"]',
    ERROR_INVALID_TYPE: '[data-testid="error-invalid-type"]',
    ERROR_MAX_FILES: '[data-testid="error-max-files"]',
    ERROR_UPLOAD_FAILED: '[data-testid="error-upload-failed"]',
    VIDEO_PLAYER: '[data-testid="video-player"]',
    VIDEO_DURATION: '[data-testid="video-duration"]',
    MEDIA_COUNT: '[data-testid="media-count"]',
  },

  // =========================================================================
  // CALENDAR
  // =========================================================================
  CALENDAR: {
    VIEW: '[data-testid="calendar-view"]',
    MONTH_TITLE: '[data-testid="calendar-month-title"]',
    WEEK_RANGE: '[data-testid="week-range"]',
    PREV: '[data-testid="calendar-prev"]',
    NEXT: '[data-testid="calendar-next"]',
    TODAY: '[data-testid="calendar-today"]',
    TODAY_CELL: '[data-testid="calendar-today-cell"]',
    VIEW_MONTH_BTN: '[data-testid="view-month-btn"]',
    VIEW_WEEK_BTN: '[data-testid="view-week-btn"]',
    MONTH_VIEW: '[data-testid="month-view"]',
    WEEK_VIEW: '[data-testid="week-view"]',
    WEEK_DAY_COLUMN: '[data-testid="week-day-column"]',
    DAY_CELL: '[data-testid="calendar-day-cell"]',
    EVENT: '[data-testid="calendar-event"]',
    EVENT_TITLE: '[data-testid="event-title"]',
    EVENT_PLATFORM_ICON: '[data-testid="event-platform-icon"]',
    EVENT_TOOLTIP: '[data-testid="event-tooltip"]',
    TOOLTIP_TITLE: '[data-testid="tooltip-title"]',
    TOOLTIP_TIME: '[data-testid="tooltip-time"]',
    TOOLTIP_STATUS: '[data-testid="tooltip-status"]',
    FILTER_ARTIST: '[data-testid="filter-artist"]',
    FILTER_PLATFORM: '[data-testid="filter-platform"]',
    FILTER_STATUS: '[data-testid="filter-status"]',
    CLEAR_FILTERS: '[data-testid="clear-filters"]',
    CREATE_POST_OPTION: '[data-testid="create-post-option"]',
    EVENT_DETAIL_MODAL: '[data-testid="event-detail-modal"]',
    PENDING_INDICATOR: '[data-testid="pending-indicator"]',
    APPROVED_INDICATOR: '[data-testid="approved-indicator"]',
    PUBLISHED_INDICATOR: '[data-testid="published-indicator"]',
  },

  // =========================================================================
  // CHAT
  // =========================================================================
  CHAT: {
    LIST: '[data-testid="chat-list"]',
    LIST_ITEM: '[data-testid="chat-list-item"]',
    ARTIST_NAME: '[data-testid="chat-artist-name"]',
    PREVIEW: '[data-testid="chat-preview"]',
    UNREAD: '[data-testid="chat-unread"]',
    ROOM: '[data-testid="chat-room"]',
    HEADER: '[data-testid="chat-header"]',
    MESSAGES: '[data-testid="chat-messages"]',
    MESSAGE: '[data-testid="chat-message"]',
    MESSAGE_CONTENT: '[data-testid="message-content"]',
    MESSAGE_SENDER: '[data-testid="message-sender"]',
    MESSAGE_TIME: '[data-testid="message-time"]',
    INPUT: '[data-testid="chat-input"]',
    SEND_BUTTON: '[data-testid="send-message"]',
    TYPING_INDICATOR: '[data-testid="typing-indicator"]',
    EMPTY_STATE: '[data-testid="chat-empty"]',
    LOADING: '[data-testid="chat-loading"]',
    BACK: '[data-testid="chat-back"]',
    CHAR_COUNT: '[data-testid="char-count"]',
  },

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  NOTIFICATIONS: {
    LIST: '[data-testid="notifications-list"]',
    ITEM: '[data-testid="notification-item"]',
    TITLE: '[data-testid="notification-title"]',
    BODY: '[data-testid="notification-body"]',
    TIME: '[data-testid="notification-time"]',
    MARK_READ: '[data-testid="mark-read"]',
    MARK_ALL_READ: '[data-testid="mark-all-read"]',
    EMPTY_STATE: '[data-testid="notifications-empty"]',
  },

  // =========================================================================
  // ARTISTS
  // =========================================================================
  ARTIST: {
    LIST: '[data-testid="artists-list"]',
    CARD: '[data-testid="artist-card"]',
    NAME: '[data-testid="artist-name"]',
    COLOR: '[data-testid="artist-color"]',
    LABEL_BADGE: '[data-testid="label-badge"]',
    SEARCH: '[data-testid="artist-search"]',
    EMPTY_STATE: '[data-testid="artists-empty"]',
    CREATE_ARTIST: '[data-testid="create-artist"]',
    DETAIL: '[data-testid="artist-detail"]',
    STATS: '[data-testid="artist-stats"]',
    STAT_TOTAL_POSTS: '[data-testid="stat-total-posts"]',
    POSTS_LIST: '[data-testid="artist-posts"]',
    OPEN_CHAT: '[data-testid="open-artist-chat"]',
    FORM: '[data-testid="artist-form"]',
    INPUT_NAME: '[data-testid="artist-name"]',
    INPUT_EMAIL: '[data-testid="artist-email"]',
    INPUT_PASSWORD: '[data-testid="artist-password"]',
    INPUT_BIO: '[data-testid="artist-bio"]',
    INPUT_INSTAGRAM: '[data-testid="artist-instagram"]',
    INPUT_SPOTIFY: '[data-testid="artist-spotify"]',
    COLOR_PICKER: '[data-testid="color-picker"]',
    COLOR_INPUT: '[data-testid="color-input"]',
    CREDENTIALS_SHARED: '[data-testid="credentials-shared"]',
    ERROR_NAME_REQUIRED: '[data-testid="error-name-required"]',
    ERROR_EMAIL_REQUIRED: '[data-testid="error-email-required"]',
    ERROR_PASSWORD_REQUIRED: '[data-testid="error-password-required"]',
    ERROR_EMAIL_INVALID: '[data-testid="error-email-invalid"]',
    ERROR_PASSWORD_WEAK: '[data-testid="error-password-weak"]',
    ERROR_EMAIL_EXISTS: '[data-testid="error-email-exists"]',
    EDIT_ARTIST: '[data-testid="edit-artist"]',
    SAVE_ARTIST: '[data-testid="save-artist"]',
    DELETE_ARTIST: '[data-testid="delete-artist"]',
    RESET_PASSWORD: '[data-testid="reset-password"]',
    RESET_PASSWORD_MODAL: '[data-testid="reset-password-modal"]',
    NEW_PASSWORD: '[data-testid="new-password"]',
    PASSWORD_REQUIREMENTS: '[data-testid="password-requirements"]',
    CONFIRM_RESET: '[data-testid="confirm-reset"]',
    CONFIRM_DELETE_MODAL: '[data-testid="confirm-delete-modal"]',
    CONFIRM_DELETE: '[data-testid="confirm-delete"]',
    CANCEL_DELETE: '[data-testid="cancel-delete"]',
  },

  // =========================================================================
  // COMMON / SHARED
  // =========================================================================
  COMMON: {
    LOADING_SPINNER: '[data-testid="loading-spinner"]',
    SKELETON_LOADER: '[data-testid="skeleton-loader"]',
    ERROR_STATE: '[data-testid="error-state"]',
    ERROR_NOT_FOUND: '[data-testid="error-not-found"]',
    FORBIDDEN_MESSAGE: '[data-testid="forbidden-message"]',
    RETRY_BUTTON: '[data-testid="retry-button"]',
    BACK_TO_HOME: '[data-testid="back-to-home"]',
    TOAST_SUCCESS: '[data-testid="toast-success"]',
    TOAST_ERROR: '[data-testid="toast-error"]',
    TOAST_INFO: '[data-testid="toast-info"]',
    TOAST_CLOSE: '[data-testid="toast-close"]',
    MODAL: '[data-testid="modal"]',
    MODAL_CLOSE: '[data-testid="modal-close"]',
    CONFIRM_ACTION: '[data-testid="confirm-action"]',
    CANCEL_ACTION: '[data-testid="cancel-action"]',
    CONFIRM_DELETE: '[data-testid="confirm-delete"]',
    OFFLINE_INDICATOR: '[data-testid="offline-indicator"]',
    SESSION_EXPIRED: '[data-testid="session-expired"]',
  },
} as const;

// Helper functions
export function withPostId(id: string): string {
  return `${S.POST.CARD}[data-post-id="${id}"]`;
}

export function withArtistId(id: string): string {
  return `${S.ARTIST.CARD}[data-artist-id="${id}"]`;
}

export function calendarDay(day: number): string {
  return `[data-testid="calendar-day-${day}"]`;
}
