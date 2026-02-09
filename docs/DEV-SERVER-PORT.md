# Development Server Port Configuration

SuperSite is configured to always use **port 3001** for development.

## Quick Start

```bash
# Start dev server (always on port 3001)
npm run dev

# Stop any running dev server on port 3001
npm run dev:stop

# Restart dev server (stop + start)
npm run dev:restart
```

## Available Commands

### `npm run dev`
Starts the Next.js development server on port 3001.

**URL:** `http://localhost:3001`

### `npm run dev:stop`
Kills any process running on port 3001. Useful when:
- Server didn't shut down properly
- You see "port already in use" error
- You want to ensure clean slate before starting

### `npm run dev:restart`
Convenience command that runs `dev:stop` then `dev`.

**Use this when:**
- You want to quickly restart after making config changes
- You're unsure if the old server is still running
- You want to ensure you're on the correct port

## Port Configuration

The port is set in three places:

1. **package.json** - `"dev": "next dev -p 3001"`
2. **env.example.txt** - `NEXT_PUBLIC_SITE_URL=http://localhost:3001`
3. **.env.local** (optional) - Add `NEXT_PUBLIC_SITE_URL=http://localhost:3001`

## Troubleshooting

### "Port 3001 is already in use"
```bash
npm run dev:stop
npm run dev
```

Or manually:
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### "Cannot find module" or compilation errors
```bash
rm -rf .next
npm run dev
```

### Server won't stop
```bash
# Force kill all node processes (use with caution)
pkill -f "next dev"
```

## Why Port 3001?

- **Consistency**: Same port every time, no confusion
- **Bookmarks**: `http://localhost:3001` always works
- **Testing**: APIs and OAuth callbacks use predictable URL
- **Collaboration**: Team members use same port
- **Documentation**: All docs reference one port

## Environment Variables

If you have `.env.local`, make sure it includes:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

This ensures the site URL is correct for:
- API endpoints
- OAuth redirects
- Email links
- Meta tags

## Production

In production, the port is determined by your hosting platform:
- Vercel: Automatic
- Railway: Uses PORT env variable
- Docker: Set in Dockerfile
- Self-hosted: Configure in start command

The `-p 3001` flag only affects local development.

## Tips

1. **Bookmark it**: Add `http://localhost:3001` to your bookmarks
2. **Use dev:restart**: It's the most reliable way to ensure clean start
3. **Check the terminal**: Always verify which port the server started on
4. **Close old tabs**: Old browser tabs on different ports can be confusing

## Related Commands

```bash
# Build for production
npm run build

# Start production server (default port 3000)
npm start

# Run tests
npm test

# Lint code
npm run lint
```
