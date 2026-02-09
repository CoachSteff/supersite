# Authentication UI Documentation

## Overview

SuperSite now includes a complete authentication system with a user-friendly UI. Site owners can enable or disable authentication through the `config/site.yaml` file.

## Features

### For Anonymous Users
- **User Icon in Header** - Click to sign in or create account
- **Passwordless Authentication** - Email-based OTP (One-Time Password) login
- **No Password Required** - Users receive a 6-digit code via email
- **Automatic Account Creation** - First-time users automatically get an account

### For Authenticated Users
- **User Menu** - Click avatar/icon to access:
  - View Profile
  - Settings
  - Sign Out
- **Profile Management** - Update name, bio, social links, etc.
- **Privacy Controls** - Control profile visibility
- **Persistent Sessions** - Stay logged in with secure cookies

## Configuration

### Enable/Disable Authentication

Edit `config/site.yaml`:

```yaml
auth:
  enabled: true              # Set to false to disable authentication
  requireApproval: false     # Future: require admin approval for new users
```

### Theme Integration

The auth button automatically integrates with your theme:
- Positioned in the header (top-right)
- Uses theme colors and styling
- Responsive design
- Dark mode support

## Components

### AuthButton (`components/AuthButton.tsx`)
- Main entry point for authentication
- Shows login button for anonymous users
- Shows user avatar/icon for logged-in users
- Manages authentication state

### AuthModal (`components/AuthModal.tsx`)
- Two-step authentication flow:
  1. **Email Entry** - User enters email address
  2. **OTP Verification** - User enters 6-digit code from email
- Error handling and validation
- Loading states
- Accessible (keyboard navigation, ARIA labels)

### UserMenu (`components/UserMenu.tsx`)
- Dropdown menu for authenticated users
- Quick access to profile and settings
- Sign out functionality
- Click-outside and escape key support

## User Flow

```
1. Anonymous User
   ↓
2. Click User Icon → AuthModal Opens
   ↓
3. Enter Email → OTP Sent
   ↓
4. Enter 6-Digit Code → Account Created/Login
   ↓
5. Authenticated → User Menu Available
```

## API Endpoints Used

- `POST /api/auth/request-otp` - Request OTP code
- `POST /api/auth/verify-otp` - Verify code and login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out
- `PATCH /api/user/profile` - Update profile
- `PATCH /api/user/settings` - Update settings

## Styling

### CSS Modules
- `styles/AuthButton.module.css` - Auth button styles
- `styles/AuthModal.module.css` - Modal and form styles
- `styles/UserMenu.module.css` - Dropdown menu styles

### Theme Variables Used
```css
--primary-color
--secondary-color
--background
--background-secondary
--text-color
--text-secondary
--border-color
--border-radius
--spacing-*
--font-size-*
```

## Security Features

- ✅ HTTP-only cookies (XSS protection)
- ✅ CSRF-safe cookie configuration
- ✅ OTP expiry (15 minutes)
- ✅ Rate limiting (5 requests/hour per email)
- ✅ Max 3 OTP attempts per code
- ✅ Email hashing for file storage
- ✅ No passwords stored

## Development Testing

### In Development Mode
OTP codes are logged to the console:
```
[Email] OTP Code for user@example.com : 123456
```

### Test Flow
1. Start dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click user icon in header
4. Enter email address
5. Check terminal for OTP code
6. Enter code to log in

## Production Setup

### Email Configuration
Add to `.env.local`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yoursite.com
```

### Security Requirements
- Set strong `JWT_SECRET` (min 32 characters)
- Enable HTTPS (required for secure cookies)
- Configure rate limiting at infrastructure level
- See `docs/PRODUCTION-CHECKLIST.md`

## Customization

### Disable Authentication
Set `auth.enabled: false` in `config/site.yaml`

### Change Button Position
Edit `themes/[your-theme]/structure.yaml`:
```yaml
header:
  auth: true  # Show/hide in header
```

### Customize Styling
Override CSS variables in your theme's `colors.yaml`

## Future Enhancements

- User approval workflow (`requireApproval: true`)
- Role-based access control
- Social login providers
- Profile photos upload
- Email verification badges
- Account deletion

## Troubleshooting

### User Icon Not Showing
- Check `config/site.yaml` → `auth.enabled: true`
- Verify theme supports auth (`header.auth: true`)
- Clear browser cache

### OTP Not Sending
- Check SMTP configuration in `.env.local`
- In development, check terminal logs
- Verify email is valid format

### Login Not Persisting
- Check cookies are enabled in browser
- Verify HTTPS in production
- Check cookie settings in `lib/auth.ts`

### Rate Limit Errors
- Wait 1 hour before retrying
- In development, restart server to reset
- Production: implement persistent rate limiting (see docs)

## Support

For issues or questions:
1. Check `docs/PRODUCTION-CHECKLIST.md`
2. Review `TEST_REPORT_AUTH_SYSTEM.md`
3. Test with `./test-auth-fixes.sh`
