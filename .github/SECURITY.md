# Security Policy

## Supported Versions

We actively support the latest version of Birdmaid. Security updates are applied to the main branch.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead:

1. Email security concerns to the repository maintainer
2. Include details about the vulnerability
3. Allow time for the issue to be addressed before public disclosure

## Security Best Practices

### For Developers

- **Never commit** `.env.prod` or any files with real secrets
- **Always use** `.env.prod.example` as a template
- **Replace** all placeholders (`YOUR_SERVER_IP`, `your-bucket-name`, etc.) with your actual values
- **Rotate** secrets regularly (JWT secrets, S3 keys, SMTP passwords)
- **Review** `SECURITY_CHECKLIST.md` before committing

### For Deployment

- Use strong, randomly generated secrets:
  ```bash
  openssl rand -base64 32  # For JWT_SECRET
  ```
- Keep `.env.prod` file secure and never commit it
- Use firewall (UFW) to restrict access
- Enable automatic security updates
- Run security hardening script: `scripts/harden-server.sh`
- Regularly backup MongoDB data
- Monitor logs for suspicious activity

### Environment Variables Security

All sensitive configuration should be in `.env.prod` file (not committed to git):

- `JWT_SECRET` - Strong random string (32+ characters)
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `SMTP_PASS` - SMTP password (if using email)
- Database credentials (if external)

See `env.prod.example` for all required variables.

## Known Security Considerations

1. **MinIO credentials** in `docker-compose.yml` are default (`minioadmin/minioadmin`) for local development only
2. **Production** should use external S3-compatible storage (see `docker-compose.prod.yml`)
3. **CORS** is configured permissive for game iframes - adjust `Caddyfile` if needed
4. **Security headers** are configured in `Caddyfile` - review and adjust as needed

## Security Updates

Security updates are applied as needed. Check:
- `docs/SECURITY.md` - Server security hardening guide
- `docs/SECURITY_HEADERS.md` - HTTP security headers configuration
- `SECURITY_CHECKLIST.md` - Pre-commit security checklist
