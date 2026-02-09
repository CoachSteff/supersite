# Quick Reference: Development Server

## Default Port: 3001

SuperSite always runs on **http://localhost:3001** in development.

## Essential Commands

```bash
# Start server
npm run dev

# Stop server
npm run dev:stop

# Restart server
npm run dev:restart
```

## Common Scenarios

### Starting Fresh
```bash
npm run dev:restart
```

### Port Already in Use
```bash
npm run dev:stop
npm run dev
```

### After Code Changes
Most changes hot-reload automatically. For config changes:
```bash
npm run dev:restart
```

### Multiple Terminal Sessions
If you have multiple terminals open, always stop before starting:
```bash
npm run dev:stop && npm run dev
```

## Bookmark This
Add to your browser bookmarks:
```
http://localhost:3001
```

## API Testing
All API endpoints are at:
```
http://localhost:3001/api/*
```

Example:
```bash
curl http://localhost:3001/api/auth/me
```

## Environment Variable
Add to `.env.local` (optional):
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

## Troubleshooting

**Problem**: Server won't start, says port in use  
**Solution**: `npm run dev:stop` then `npm run dev`

**Problem**: Getting 404 on all routes  
**Solution**: `rm -rf .next && npm run dev`

**Problem**: Changes not showing up  
**Solution**: Hard refresh browser (Cmd+Shift+R) or `npm run dev:restart`

**Problem**: Multiple servers running  
**Solution**: `pkill -f "next dev"` to kill all

## Why This Matters

- ✅ Consistent URL across sessions
- ✅ Bookmarks always work
- ✅ Documentation stays accurate
- ✅ No confusion with team members
- ✅ OAuth callbacks work reliably
- ✅ Testing is predictable

## See Also
- Full documentation: `docs/DEV-SERVER-PORT.md`
- Authentication setup: `docs/AUTH-UI-COMPLETE.md`
- Production checklist: `docs/PRODUCTION-CHECKLIST.md`
