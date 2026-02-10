# Cookie Notification System - Quick Start Testing

## Testing the Fixes

The cookie notification system now uses **separate localStorage keys** to avoid conflicts between anonymous and authenticated users.

---

## Quick Test Steps

### Test 1: Anonymous User (Bottom-Right Notice)

1. **Open browser console** (F12 or Cmd+Option+I)
2. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **Expected Result**: Cookie notice appears in **bottom-right corner**
4. **Test Actions**:
   - Click "Accept" → notice disappears
   - Reload page → notice stays hidden
   - Check localStorage:
     ```javascript
     localStorage.getItem('anonymous_cookie_seen'); // Should be "true"
     ```

### Test 2: Authenticated User (Notification Center)

1. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   ```
2. **Sign in** to the application
3. **Expected Result**: 
   - Red badge appears on profile avatar (count: 1)
   - No bottom-right notice
4. **View notification**:
   - Click avatar → "Notifications"
   - See "Cookie Preferences" notification
   - Click notification → form expands inline
5. **Check localStorage**:
   ```javascript
   localStorage.getItem('auth_cookie_notification_created'); // Should be "true"
   ```

### Test 3: Transition (Anonymous → Authenticated)

1. **Clear localStorage** and visit site (not logged in)
2. **See anonymous notice** in bottom-right
3. **Sign in** while notice is visible
4. **Expected**: 
   - Anonymous notice disappears automatically
   - Red badge appears on avatar
   - Cookie notification available in notification center

---

## localStorage Keys Reference

### Before Fix (Conflicting ❌)
```
cookie_notification_seen  ← Both systems used this
```

### After Fix (Separated ✅)
```
anonymous_cookie_seen              ← Anonymous notice
anonymous_cookie_preferences_set   ← Anonymous preferences saved
auth_cookie_notification_created   ← Authenticated notification created
```

---

## Troubleshooting

### Notice doesn't appear for anonymous users
```javascript
// Check flags
localStorage.getItem('anonymous_cookie_seen');
localStorage.getItem('anonymous_cookie_preferences_set');

// Both should be null or undefined
// If they exist, clear them:
localStorage.removeItem('anonymous_cookie_seen');
localStorage.removeItem('anonymous_cookie_preferences_set');
location.reload();
```

### Notification doesn't appear for authenticated users
```javascript
// Check flag
localStorage.getItem('auth_cookie_notification_created');

// Should be null before first login
// If it exists but notification is missing:
localStorage.removeItem('auth_cookie_notification_created');
// Then log out and log in again
```

### Old conflicting keys
```javascript
// Remove old keys if they exist:
localStorage.removeItem('cookie_notification_seen');
localStorage.removeItem('cookie_preferences_set');
```

---

## Expected Console Output

These are **normal** and not errors:
```
Download the React DevTools...
[ThemeLoader] Applying theme: Object
Failed to load resource: /api/auth/me (401 Unauthorized)  ← Normal when not logged in
```

---

## Success Criteria

✅ Anonymous users see bottom-right notice on first visit  
✅ Authenticated users see notification in notification center  
✅ Both systems use separate localStorage keys  
✅ No conflicts between the two flows  
✅ Transition from anonymous to authenticated works smoothly  
✅ Build succeeds with no errors  

---

## Files Modified

1. **`components/AnonymousCookieNotice.tsx`**
   - Changed: `cookie_notification_seen` → `anonymous_cookie_seen`
   - Changed: `cookie_preferences_set` → `anonymous_cookie_preferences_set`
   - Added: Authentication detection to hide notice when user logs in

2. **`components/AuthButton.tsx`**
   - Changed: `cookie_notification_seen` → `auth_cookie_notification_created`
   - Verified: Function called only when user is authenticated

---

## Next Steps

1. Test both flows in development
2. Verify localStorage keys are set correctly
3. Confirm no console errors
4. Test anonymous → authenticated transition
5. Ready for production!

For detailed testing instructions, see: `docs/COOKIE_NOTIFICATION_TESTING.md`
