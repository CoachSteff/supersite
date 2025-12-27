# GitHub Release Checklist

This document provides step-by-step instructions for publishing the first alpha release to GitHub.

## ✅ Pre-Release Checklist (Completed)

- [x] Repository initialized with git
- [x] All files committed to main branch
- [x] Version updated to `0.1.0-alpha.1` in package.json
- [x] CHANGELOG.md updated with release information
- [x] RELEASE_NOTES.md created
- [x] README.md updated with alpha notice and badges
- [x] .env.example created for users
- [x] LICENSE file present (MIT)
- [x] CONTRIBUTING.md present
- [x] SECURITY.md present
- [x] GitHub templates present (.github/ISSUE_TEMPLATE, PR template)
- [x] CI/CD workflow configured (.github/workflows/ci.yml)
- [x] Git tag created (`v0.1.0-alpha.1`)
- [x] All tests passing (Jest + Playwright)
- [x] Documentation complete and reviewed

## 📋 GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `supersite`
3. **Description:** "A universal AI-powered website template built with Next.js"
4. **Visibility:** Public
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### 2. Push to GitHub

```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/coachsteff/supersite.git

# Push main branch
git push -u origin main

# Push tags
git push origin --tags
```

### 3. Configure Repository Settings

Go to **Settings** in your GitHub repository:

#### General Settings
- **Features:**
  - ✅ Issues
  - ✅ Discussions (recommended for community)
  - ✅ Projects (optional)
  - ✅ Wiki (optional)
  
#### Pages (Optional)
- You can set up GitHub Pages for documentation later

#### Branches
- **Default branch:** main
- **Branch protection rules (recommended):**
  - Require pull request reviews before merging
  - Require status checks to pass (CI/CD)
  - Require conversation resolution before merging

#### Security
- **Enable Dependabot alerts:** Yes
- **Enable Dependabot security updates:** Yes

### 4. Add Topics/Tags

Add relevant topics to help users discover your project:
- `nextjs`
- `ai`
- `chatbot`
- `template`
- `cms`
- `markdown`
- `typescript`
- `yaml-config`
- `ai-chat`
- `seo`

### 5. Create GitHub Release

1. Go to **Releases** → **Create a new release**
2. **Choose a tag:** Select `v0.1.0-alpha.1`
3. **Release title:** `v0.1.0-alpha.1 - First Alpha Release`
4. **Description:** Copy content from RELEASE_NOTES.md or use this template:

```markdown
# 🎉 First Alpha Release!

This is the first public alpha release of Supersite - an AI-powered, markdown-based website template built with Next.js.

## ⚠️ Alpha Release Notice

This is an alpha release. APIs and configuration may change in future versions. Use in production at your own discretion.

## ✨ What's Included

### Core Features
- ✅ AI Chat Integration (Anthropic, OpenAI, Gemini, Ollama)
- ✅ YAML Configuration
- ✅ Markdown Content Management
- ✅ Auto-Generated Navigation
- ✅ Full-Text Search
- ✅ Blog System
- ✅ Dark/Light Mode
- ✅ Contact Form
- ✅ SEO Optimized
- ✅ Responsive Design

### Documentation
- 📖 Comprehensive README
- 📖 Configuration Guide
- 📖 Quick Start Guide
- 📖 Testing Guide
- 📖 Contributing Guidelines

### Quality
- ✅ TypeScript throughout
- ✅ 100% test pass rate
- ✅ Jest + Playwright tests
- ✅ CI/CD workflow

## 🚀 Quick Start

```bash
git clone https://github.com/coachsteff/supersite.git
cd supersite
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## 📋 Requirements

- Node.js 18+
- AI provider API key (Anthropic/OpenAI/Gemini or Ollama)

## 💬 Feedback

We welcome your feedback!
- 🐛 Report bugs via [Issues](https://github.com/coachsteff/supersite/issues)
- 💡 Request features via [Issues](https://github.com/coachsteff/supersite/issues)
- 💬 Ask questions via [Discussions](https://github.com/coachsteff/supersite/discussions)

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

**Part of the Super family:** [superskills](https://github.com/coachsteff/superskills)
```

5. Check **Set as a pre-release** ✅
6. Click **Publish release**

### 6. Set Up Secrets for CI/CD (Optional)

If you want the CI/CD to run builds with AI providers:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets (optional):
   - `ANTHROPIC_API_KEY` (for testing)
   - `OPENAI_API_KEY` (for testing)
   - `GEMINI_API_KEY` (for testing)

**Note:** Tests can run without these, but build step may fail without at least one provider key.

### 7. Create Initial Discussions (Optional but Recommended)

Create some discussion categories:
- 💬 General - For general questions
- 💡 Ideas - For feature suggestions
- 🙏 Q&A - For help and support
- 🎉 Show and tell - For users to share their sites

### 8. Pin Important Issues/Discussions

Consider creating and pinning:
- "Welcome to Supersite!" discussion
- "Roadmap" discussion
- "Known Issues" issue

### 9. Update Social Preview

1. Go to **Settings** → Scroll to **Social preview**
2. Upload an image (1280x640px recommended)
3. This appears when sharing your repo on social media

## 📢 Post-Release Tasks

### Announce the Release

1. **Twitter/X:**
   ```
   🎉 Supersite v0.1.0-alpha.1 is here!
   
   An AI-powered, markdown-based website template built with Next.js
   
   ✨ Multi-AI support
   📝 YAML config
   🔍 Full-text search
   📱 Fully responsive
   
   Open source & MIT licensed!
   
   https://github.com/coachsteff/supersite
   
   #NextJS #AI #WebDev #OpenSource
   ```

2. **Dev.to/Hashnode:** Write a blog post about the release

3. **Reddit:** Share in relevant subreddits:
   - r/nextjs
   - r/javascript
   - r/webdev
   - r/opensource

4. **Hacker News:** Submit to Show HN

5. **Product Hunt:** Consider submitting

### Monitor and Respond

- Check GitHub notifications regularly
- Respond to issues and discussions promptly
- Thank contributors
- Update documentation based on feedback

### Update Links

Make sure these are working:
- Repository URL in package.json: ✅
- Links in README: ✅
- Links in documentation: ✅
- License attribution: ✅

## 🔄 For Future Releases

1. Update version in package.json
2. Update CHANGELOG.md
3. Update RELEASE_NOTES.md
4. Run full test suite
5. Commit changes
6. Create git tag
7. Push to GitHub
8. Create GitHub Release
9. Announce

---

## ✅ Ready to Publish!

Your repository is now ready for its first alpha release on GitHub! Follow the steps above to make it public.

Good luck! 🚀
