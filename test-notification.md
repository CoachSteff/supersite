# Notification System Testing Guide

## Manual Testing Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Sign in to the Application
- Navigate to http://localhost:3001
- Click the profile icon
- Sign in with your account

### 3. Create a Test Notification (Using API)
Open a new terminal and create a test notification:

```bash
# First, get your session cookie from the browser DevTools (Application > Cookies)
# Then use it in the curl command below

# Replace YOUR_USER_ID with your actual user ID from data/users/{userId}.yaml
curl -X POST http://localhost:3001/api/notifications/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "userIds": ["YOUR_USER_ID"],
    "type": "system",
    "title": "Welcome to SuperSite!",
    "message": "Your notification system is now active and working.",
    "link": "/"
  }'
```

### 4. Verify Notification Badge
- Look at the profile avatar icon in the header
- You should see a small red badge with "1" in the top-right corner

### 5. View Notifications
- Click on the profile avatar
- Click "Notifications" in the dropdown menu
- You should see the NotificationPanel with your test notification

### 6. Mark Notification as Read
- Click on the notification item
- The notification should be marked as read
- The red badge should disappear

### 7. Test "Mark All as Read"
- Create multiple test notifications (repeat step 3 with different titles)
- Open the NotificationPanel
- Click "Mark all read" button
- All notifications should be marked as read
- Badge should disappear

### 8. Test Polling (30-second auto-refresh)
- Create a new notification using the API
- Wait 30 seconds without refreshing the page
- The badge should update automatically to show the new notification

## Expected Behavior

✓ Red badge appears on avatar when unread notifications exist
✓ Badge shows count (up to 9, then "9+")
✓ Badge disappears when all notifications are read
✓ Clicking notification marks it as read
✓ "Mark all read" button works
✓ Notifications show relative timestamps ("2 minutes ago")
✓ Poll updates every 30 seconds
✓ Clicking notification with link navigates to that page
✓ Empty state shows "No notifications yet"

## Files Created

- lib/notifications.ts
- lib/time-utils.ts
- app/api/notifications/route.ts
- app/api/notifications/mark-read/route.ts
- app/api/notifications/create/route.ts
- components/NotificationBadge.tsx
- components/NotificationPanel.tsx
- styles/NotificationBadge.module.css
- styles/NotificationPanel.module.css

## Files Modified

- components/AuthButton.tsx (added polling and badge)
- components/UserMenu.tsx (added Notifications menu item)
- components/settings/ProfileSettings.tsx (fixed type issue)
- components/Hero.tsx (fixed type issue)
- components/ThemedLayout.tsx (removed invalid prop)
- lib/link-utils.ts (fixed type signature)
