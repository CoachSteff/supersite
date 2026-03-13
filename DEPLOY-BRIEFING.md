# Deployment Briefing: coachsteff.live on hostinger-web

This document is written for the agent deploying **coachsteff.live** to the new production web server `hostinger-web` (srv927827). It covers the server setup, the application architecture, and every step needed to get the site live.

Read this entire document before starting.

---

## 1. Server Overview

**Server:** srv927827 (Hostinger KVM 2)
**IP:** 148.230.112.252
**SSH:** `ssh hostinger-web` (connects as `deploy` user via `~/.ssh/hostinger` key)
**OS:** Ubuntu 24.04.4 LTS
**Provisioned:** March 12, 2026

### Installed stack

| Component | Version | Status |
|-----------|---------|--------|
| Caddy | v2.11.2 | Active (auto-HTTPS via Let's Encrypt) |
| Node.js | v22.22.1 LTS | Ready |
| PM2 | v6.0.14 | Running, startup configured for `deploy` user |
| PHP 8.3 FPM | 8.3.6 | Active (not needed for this site, but available) |
| MySQL | 8.0.45 | Active (not needed for this site, but available) |
| Git | 2.43.0 | Ready, GitHub deploy key installed |

### Security

- UFW firewall active (SSH, HTTP, HTTPS only)
- fail2ban active (SSH jail)
- Root login disabled, password auth disabled (key-only)
- Timezone: Europe/Brussels

### Directory layout

```
/var/www/
├── sites/              # One subdirectory per domain
│   └── coachsteff.live/    # <-- This is where the site goes
└── shared/
    └── logs/           # Caddy access log, PM2 app logs
```

### Caddy configuration

```
/etc/caddy/
├── Caddyfile               # Main config (global settings, snippets, imports)
└── sites/
    ├── default.caddy       # Catch-all for unconfigured domains
    ├── *.caddy             # Per-site configs (auto-imported by Caddyfile)
    ├── static-site.template
    ├── node-app.template   # <-- Use this as the starting point
    └── php-site.template
```

The main Caddyfile defines two reusable snippets: `(security_headers)` and `(compression)`. Import them in every site config.

### Deploy scripts (on PATH for deploy user)

- `site-init <domain> <git-repo> [static|node|php]` -- Clone, create Caddy config, reload
- `deploy-static <domain>` -- Git pull only
- `deploy-node <domain>` -- Git pull + npm ci + npm run build + PM2 restart
- `deploy-php <domain>` -- Git pull + composer install

### GitHub access

The `deploy` user has an ED25519 SSH key configured for `github.com` (added to the CoachSteff GitHub account as `hostinger-web-deploy`). The key is at `/home/deploy/.ssh/github_deploy` and SSH config routes `github.com` through it automatically.

---

## 2. Application: coachsteff.live

### What it is

A **Next.js 14 App Router** site (TypeScript) built on the SuperSite framework. It's a personal/professional site for Steff VanHaverbeke with pages, blog, AI chat, and multilingual support.

### Git repository

- **Repo:** `git@github.com:CoachSteff/supersite.git`
- **Branch:** `main`
- **Note:** The repo contains the generic SuperSite framework. All CoachSteff-specific content, theme, and config are **gitignored** and must be placed on the server separately.

### Key scripts

```bash
npm run build     # Production build (next build)
npm start         # Start production server (next start)
npm run dev       # Dev only -- do NOT use in production
```

The production server runs `next start`, which defaults to port 3000. Caddy reverse-proxies HTTPS traffic to this port.

### Node.js compatibility

The app requires Node.js 18+ (uses Next.js 14). The server has Node.js 22.22.1, which is fine.

---

## 3. Site-Specific Files (Not in Git)

These files are gitignored. They must be copied to the server manually. They currently live on the local development machine at `/Users/steffvanhaverbeke/Sites/coachsteff_live/`.

### 3.1 Environment variables: `.env.local`

```
GEMINI_API_KEY=<the Gemini API key>
NEXT_PUBLIC_SITE_URL=https://coachsteff.live
```

The `GEMINI_API_KEY` powers the AI chat assistant and multilingual translation. The `NEXT_PUBLIC_SITE_URL` is used for SEO and canonical URLs.

**Note:** There is no `JWT_SECRET` currently set in the local `.env.local`. If auth is re-enabled later, one must be generated and added.

### 3.2 Site config: `config/site.local.yaml`

This is a 122-line YAML file that defines everything about the CoachSteff.live instance: site name, branding, SEO, navigation links, chat configuration (Gemini 2.0 Flash), social links, hero section, and multilingual settings.

Copy the entire file from the local machine to the server at the same relative path.

### 3.3 Custom content: `content-custom/`

```
content-custom/
├── pages/
│   ├── index.md           # Homepage content
│   ├── about/index.md     # About page
│   ├── frameworks/index.md
│   ├── products/index.md
│   └── services/index.md
└── blog/
    └── 2026-03-01-welcome-to-coachsteff.md
```

These Markdown files with YAML frontmatter are the actual page content. Without them, the site falls back to generic SuperSite template content.

### 3.4 Custom themes: `themes-custom/`

```
themes-custom/
├── parchment-sky/         # Active theme
│   ├── colors.yaml
│   ├── structure.yaml
│   ├── blocks.yaml
│   └── theme.yaml
└── coachsteff/            # Previous "Clear Teal" theme (backup)
    ├── colors.yaml
    ├── structure.yaml
    ├── blocks.yaml
    └── theme.yaml
```

The active theme is `parchment-sky`, set in `config/site.local.yaml` under `branding.theme`.

### 3.5 Public assets: `public/images/`

Currently empty on the local machine. The site config references `/images/logo-coachsteff.png` and `/images/og-coachsteff.png` but these files don't exist yet. The site works without them (no logo image, no OG image). If/when they're created, place them in `public/images/` on the server.

---

## 4. Deployment Steps

### Step 1: Clone the repo

```bash
ssh hostinger-web
cd /var/www/sites
git clone git@github.com:CoachSteff/supersite.git coachsteff.live
cd coachsteff.live
```

Do NOT use `site-init` for this deployment. The Node app needs extra setup beyond what the script handles (site-specific files, PM2 config). Use it for simpler sites.

### Step 2: Copy site-specific files from local machine

From the local machine, use `scp` or `rsync`:

```bash
# Environment variables
scp ~/.env.local-coachsteff hostinger-web:/var/www/sites/coachsteff.live/.env.local

# Site config
scp config/site.local.yaml hostinger-web:/var/www/sites/coachsteff.live/config/site.local.yaml

# Custom content (recursive)
scp -r content-custom/ hostinger-web:/var/www/sites/coachsteff.live/content-custom/

# Custom themes (recursive)
scp -r themes-custom/ hostinger-web:/var/www/sites/coachsteff.live/themes-custom/
```

Or more cleanly with rsync from the local project root:

```bash
rsync -av --relative .env.local config/site.local.yaml content-custom/ themes-custom/ hostinger-web:/var/www/sites/coachsteff.live/
```

### Step 3: Install dependencies and build

```bash
ssh hostinger-web
cd /var/www/sites/coachsteff.live
npm ci --production=false    # Need devDependencies for the build (TypeScript, etc.)
npm run build
```

The build will show some warnings about dynamic routes using `cookies()` and `unstable_noStore`. These are normal and expected. The build should complete successfully.

### Step 4: Create PM2 ecosystem config

Create `/var/www/sites/coachsteff.live/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'coachsteff-live',
    cwd: '/var/www/sites/coachsteff.live',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    log_file: '/var/www/shared/logs/coachsteff-live.log',
    error_file: '/var/www/shared/logs/coachsteff-live-error.log',
    time: true
  }]
};
```

Then start it:

```bash
cd /var/www/sites/coachsteff.live
pm2 start ecosystem.config.js
pm2 save
```

Verify it's running:

```bash
pm2 list
curl http://localhost:3000
```

### Step 5: Create Caddy site config

Create `/etc/caddy/sites/coachsteff.live.caddy`:

```caddy
coachsteff.live {
    reverse_proxy localhost:3000
    import compression
    import security_headers
}

www.coachsteff.live {
    redir https://coachsteff.live{uri} permanent
}
```

Validate and reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Step 6: Point DNS

The domain `coachsteff.live` needs its DNS A record pointing to `148.230.112.252`. Check where DNS is currently managed (Hostinger or GoDaddy) and update accordingly.

Once DNS propagates, Caddy will automatically obtain a Let's Encrypt SSL certificate. No manual SSL setup needed.

### Step 7: Verify

```bash
# Check PM2 process is running
pm2 list

# Check Caddy is proxying correctly
curl -I https://coachsteff.live

# Check the site loads
curl -s https://coachsteff.live | head -30
```

---

## 5. Future Deployments (Updates)

After the initial setup, updates are simple:

```bash
ssh hostinger-web 'deploy-node coachsteff.live'
```

This runs: `git pull` -> `npm ci` -> `npm run build` -> `pm2 restart coachsteff-live`.

For content-only changes (Markdown files in `content-custom/`), use rsync from the local machine and then rebuild:

```bash
rsync -av content-custom/ hostinger-web:/var/www/sites/coachsteff.live/content-custom/
ssh hostinger-web 'cd /var/www/sites/coachsteff.live && npm run build && pm2 restart coachsteff-live'
```

---

## 6. Migration Notes

### Current deployment (hostinger-ollama)

The site is currently running on `hostinger-ollama` (srv755416, IP 69.62.106.56) as a systemd service called `coachsteff-live` behind Nginx. After confirming the new deployment works on hostinger-web:

1. Update DNS from 69.62.106.56 to 148.230.112.252
2. Wait for propagation (check with `dig coachsteff.live`)
3. Stop the old service: `ssh hostinger-ollama 'systemctl stop coachsteff-live && systemctl disable coachsteff-live'`
4. This frees up resources on hostinger-ollama for its primary role (AI/Docker workloads)

### What changes

| Aspect | Old (hostinger-ollama) | New (hostinger-web) |
|--------|------------------------|---------------------|
| IP | 69.62.106.56 | 148.230.112.252 |
| Web server | Nginx | Caddy (auto-HTTPS) |
| Process manager | systemd | PM2 |
| SSH user | root | deploy |
| Port | 3003 | 3000 |

---

## 7. Troubleshooting

### Build fails

- Check Node.js version: `node --version` (needs 18+, server has 22)
- Check disk space: `df -h /` (needs ~500MB for node_modules + build)
- Ensure all site-specific files exist (missing `config/site.local.yaml` can cause config errors)

### Site returns 502

- Check PM2: `pm2 list` (is the process online?)
- Check PM2 logs: `pm2 logs coachsteff-live --lines 50`
- Check if port 3000 is listening: `ss -tlnp | grep 3000`

### SSL certificate not issued

- Caddy needs ports 80 and 443 open (UFW allows both)
- DNS must point to 148.230.112.252 before Caddy can verify the domain
- Check Caddy logs: `sudo journalctl -u caddy --no-pager -n 50`

### Content not showing

- Verify `content-custom/` exists and has the Markdown files
- Verify `config/site.local.yaml` has `content.customDirectory: content-custom`
- Rebuild: `npm run build && pm2 restart coachsteff-live`

### Theme not applying

- Verify `themes-custom/parchment-sky/` exists with all 4 YAML files
- Verify `config/site.local.yaml` has `branding.theme: parchment-sky`
- Rebuild and restart

---

## 8. Reference

- **Hostinger SSH skill:** `/hostinger-ssh` -- Full server operations reference
- **Project CLAUDE.md:** In the repo root -- Architecture, config system, theme system, conventions
- **Caddy docs:** https://caddyserver.com/docs/
- **PM2 docs:** https://pm2.keymetrics.io/docs/

---

*Briefing prepared March 12, 2026. Server provisioned same day.*
