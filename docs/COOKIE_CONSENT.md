# Cookie Consent System - Integrated Notification Approach

## Overview

SuperSite's cookie consent system is **integrated into the notification system**, providing a subtle, non-intrusive way for users to manage cookie preferences. Instead of a large banner blocking the page, cookie preferences appear as a notification that users can interact with when ready.

## Key Features

### Subtle Integration
- ✅ Appears as a notification in the notification center
- ✅ Small red badge on profile avatar indicates unread notification
- ✅ No blocking banner or modal
- ✅ User can dismiss and revisit anytime from settings

### User Experience
- **First visit**: Cookie preference notification automatically created
- **Notification badge**: Shows unread count (includes cookie notification)
- **Click notification**: Expands inline form to set preferences
- **Settings page**: Dedicated "Cookies" tab for managing preferences anytime

### Privacy-Focused
- Only uses essential session cookies by default
- Analytics and marketing cookies are placeholders (not implemented)
- Clear disclosure of cookie usage
- User control over all preferences

---

## Implementation Architecture

### Components

1. **CookiePreferencesForm** (`components/CookiePreferencesForm.tsx`)
   - Standalone form for cookie preferences
   - Can be embedded in notifications or settings
   - Three buttons: Accept All, Reject Optional, Save Selected
   - Displays three categories: Necessary (locked), Analytics, Marketing

2. **NotificationPanel** (`components/NotificationPanel.tsx`)
   - Updated to detect cookie preference notifications
   - Expands inline form when cookie notification clicked
   - Handles saving and refreshing

3. **CookieSettings** (`components/settings/CookieSettings.tsx`)
   - Settings page tab for cookie management
   - Embeds CookiePreferencesForm
   - Allows users to revisit preferences anytime

### API Endpoints

1. **GET/POST `/api/cookie-preferences`**
   - Fetch and save user cookie preferences
   - Stores preferences per user (or anonymous)
   - Returns current preferences

2. **POST `/api/notifications/cookie-prompt`**
   - Creates cookie preference notification
   - Only creates if user hasn't set preferences
   - Idempotent (checks localStorage flag)

### Storage

**Cookie Preferences**: `data/cookie-preferences.yaml`
```yaml
anonymous:
  necessary: true
  analytics: false
  marketing: false
  timestamp: "2026-02-09T10:30:00Z"
users:
  user-id-123:
    necessary: true
    analytics: false
    marketing: false
    timestamp: "2026-02-09T11:00:00Z"
```

**Cookie Notification**: `data/users/{userId}/notifications.yaml`
```yaml
notifications:
  - id: "uuid-v4"
    type: "system"
    title: "Cookie Preferences"
    message: "SuperSite uses only essential session cookies. Click to review your cookie preferences."
    createdAt: "2026-02-09T10:30:00Z"
    read: false
    metadata:
      context:
        type: "cookie-preferences"
```

---

## User Flow

### First-Time Visitor

1. **Visits site** → AuthButton loads
2. **Checks localStorage** → `cookie_notification_seen` not found
3. **Creates notification** → Calls `/api/notifications/cookie-prompt`
4. **Badge appears** → Red badge on profile avatar (unread count: 1)
5. **Sets flag** → `localStorage.cookie_notification_seen = 'true'`

### Reviewing Cookie Preferences

**Option 1: From Notification**
1. Click profile avatar
2. Click "Notifications" in dropdown
3. See "Cookie Preferences" notification
4. Click notification → inline form expands
5. Choose preferences:
   - Accept All (enables all cookies)
   - Reject Optional (only necessary cookies)
   - Save Selected (custom selection)
6. Form saves → notification stays visible but marked as read

**Option 2: From Settings**
1. Click profile avatar
2. Click "Settings"
3. Navigate to "Cookies" tab
4. Modify preferences as needed
5. Click "Accept All", "Reject Optional", or "Save Selected"

### Revisiting Preferences

Users can change cookie preferences anytime:
- Navigate to Settings → Cookies tab
- Modify selections and save

---

## Design Principles

### Subtlety
- No blocking UI
- Notification badge is small and unobtrusive
- Form only appears when user wants to interact
- Fully integrated into existing notification system

### User Control
- User decides when to review preferences
- Can dismiss and come back later
- Settings tab always available for changes
- Clear, simple options

### Accessibility
- Keyboard navigation supported
- ARIA labels on all interactive elements
- Screen reader friendly
- High contrast text and buttons

---

## Testing

### Manual Test Flow

1. **First Visit Test**
   ```bash
   # Clear localStorage
   localStorage.clear();
   
   # Reload page
   location.reload();
   
   # Expected: Red badge appears on avatar with count "1"
   ```

2. **View Notification Test**
   - Click profile avatar
   - Click "Notifications"
   - See "Cookie Preferences" notification
   - Should be unread (bold, blue border)

3. **Expand Form Test**
   - Click "Cookie Preferences" notification
   - Form should expand inline
   - Three checkboxes visible
   - Necessary is checked and disabled

4. **Save Preferences Test**
   - Toggle Analytics or Marketing
   - Click "Save Selected"
   - Success message appears
   - Notification marked as read
   - Badge updates (count decreases)

5. **Settings Tab Test**
   - Navigate to Settings
   - Click "Cookies" tab
   - Form appears with current preferences
   - Modify and save
   - Success message appears

6. **Persistence Test**
   - Set preferences
   - Close browser
   - Reopen and navigate to Settings → Cookies
   - Preferences should be preserved

### API Testing

```bash
# Get current preferences
curl http://localhost:3001/api/cookie-preferences

# Save preferences
curl -X POST http://localhost:3001/api/cookie-preferences \
  -H "Content-Type: application/json" \
  -d '{"analytics": true, "marketing": false}'

# Create cookie notification
curl -X POST http://localhost:3001/api/notifications/cookie-prompt
```

---

## Files Created/Modified

### New Files
```
lib/cookie-preferences.ts
app/api/cookie-preferences/route.ts
app/api/notifications/cookie-prompt/route.ts
components/CookiePreferencesForm.tsx
components/settings/CookieSettings.tsx
styles/CookieConsent.module.css (repurposed for form)
```

### Modified Files
```
components/AuthButton.tsx (ensureCookieNotification)
components/NotificationPanel.tsx (expandable notifications)
app/settings/page.tsx (added Cookies tab)
styles/NotificationPanel.module.css (expanded content styles)
```

### Removed Files
```
components/CookieConsent.tsx (old banner approach - deleted)
```

---

## Cookie Categories

### Necessary Cookies (Required)
- **Purpose**: Authentication and session management
- **Details**: Session cookie (`session`) stored as HTTP-only cookie
- **User Control**: Cannot be disabled (essential for functionality)
- **Duration**: Session-based (expires on browser close)

### Analytics Cookies (Optional - Not Implemented)
- **Purpose**: Understand site usage patterns
- **Status**: Placeholder for future implementation
- **User Control**: Can be enabled/disabled
- **Current State**: Not active

### Marketing Cookies (Optional - Not Implemented)
- **Purpose**: Targeted advertising
- **Status**: Placeholder for future implementation
- **User Control**: Can be enabled/disabled
- **Current State**: Not active

---

## Compliance

### GDPR Requirements
✅ Clear information about cookie usage
✅ Explicit consent before non-essential cookies
✅ Granular control (category-level)
✅ Easy to accept or reject
✅ Persistent storage of preferences
✅ Ability to change preferences anytime

### CCPA Requirements
✅ Disclosure of data collection practices
✅ User control over data usage
✅ Clear opt-out mechanism

---

## Future Enhancements

1. **Analytics Integration**
   - Respect preferences when initializing analytics
   - Conditional script loading based on consent

2. **Marketing Integration**
   - Third-party advertising scripts
   - Conditional loading based on preferences

3. **Enhanced Disclosure**
   - Detailed cookie table with names, purposes, durations
   - Link to full privacy policy

4. **Consent Logging**
   - Backend tracking of consent actions
   - Audit trail for compliance

5. **Multi-language Support**
   - Translated cookie descriptions
   - Localized preference labels

6. **Geolocation-based Defaults**
   - Different defaults for EU vs non-EU users
   - Compliance with regional regulations

---

## Developer Notes

### Respecting User Preferences

When adding analytics or marketing features:

```typescript
// Check preferences before initializing
async function initializeAnalytics() {
  const response = await fetch('/api/cookie-preferences');
  const { preferences } = await response.json();
  
  if (preferences.analytics) {
    // Initialize analytics SDK
  }
}
```

### Adding New Cookie Categories

1. Update `CookiePreferences` interface in `lib/cookie-preferences.ts`
2. Add new checkbox in `CookiePreferencesForm.tsx`
3. Update API validation in `app/api/cookie-preferences/route.ts`
4. Update documentation

### Styling Customization

Modify `styles/CookieConsent.module.css` to customize:
- Form layout and spacing
- Button colors and styles
- Category display
- Success message appearance

---

## Support

For questions or issues:
- Check component source: `components/CookiePreferencesForm.tsx`
- Review API logic: `lib/cookie-preferences.ts`
- Test endpoints: `app/api/cookie-preferences/route.ts`
