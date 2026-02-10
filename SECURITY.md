# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in SuperSite, please follow these steps:

1. **Do NOT** open a public issue
2. **Email** the maintainers (details in package.json or GitHub profile)
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

When using SuperSite:

1. **Never commit `.env` or `.env.local` files** - they contain API keys
2. **Keep dependencies updated** - run `npm audit` regularly
3. **Use environment variables** for all sensitive data
4. **Review `config/site.yaml`** before deployment - ensure no secrets exposed
5. **Enable HTTPS** in production
6. **Rotate API keys** periodically

## Known Security Considerations

### API Key Storage

- API keys are stored in `.env.local` (never committed to git)
- API keys are only accessed server-side (never sent to client)
- Client-safe configuration is exposed via `/api/config` endpoint

### Content Security

- User-generated content is sanitized
- Markdown rendering is safe from XSS
- CSRF protection enabled for forms

### AI Chat Security

- AI responses are streamed server-side only
- Context includes only public site content
- No user data is logged or stored in AI requests
- API provider terms of service apply

## Dependency Security

Run `npm audit` regularly to check for known vulnerabilities:

```bash
npm audit
npm audit fix  # Apply automatic fixes
```

## Questions?

For security-related questions that are not vulnerabilities, please open a GitHub discussion.
