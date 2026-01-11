# Security Headers Configuration

This document describes the security headers configured in the Caddy reverse proxy for Birdmaid.

## Frontend Headers (birdmaid.{DOMAIN})

### X-Frame-Options
```
X-Frame-Options: SAMEORIGIN
```
- **Purpose**: Allows embedding in iframes from the same origin
- **Why**: Games are embedded in iframes, so we need to allow same-origin embedding
- **Reference**: [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- **Purpose**: Prevents MIME type sniffing
- **Why**: Prevents browsers from interpreting files as a different MIME type
- **Reference**: [MDN X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- **Purpose**: Enables XSS filtering in legacy browsers
- **Why**: Provides additional protection against XSS attacks
- **Note**: Modern browsers have built-in XSS protection, but this helps with older browsers
- **Reference**: [Nginx X-XSS-Protection](https://docs.nginx.com/nginx-management-suite/acm/how-to/policies/proxy-response-headers/)

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- **Purpose**: Controls how much referrer information is sent
- **Why**: Balances privacy and functionality
- **Reference**: [MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

### Permissions-Policy
```
Permissions-Policy: geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(self),payment=()
```
- **Purpose**: Restricts browser features and APIs
- **Why**: Prevents unauthorized access to sensitive browser features
- **Note**: `fullscreen=(self)` is allowed for game iframes
- **Reference**: [MDN Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

### Content-Security-Policy
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src 'self' *; connect-src 'self' https:;
```
- **Purpose**: Controls what resources can be loaded
- **Why**: Prevents XSS and injection attacks
- **Note**: 
  - `frame-src 'self' *` allows games to be embedded from any source (required for game iframes)
  - `'unsafe-inline'` and `'unsafe-eval'` are needed for React/Vite development builds
  - Consider tightening for production if possible
- **Reference**: [Content Security Policy Reference](https://content-security-policy.com/)

### Server Tokens
```
-Server
```
- **Purpose**: Removes server version information from headers
- **Why**: Prevents information disclosure about server software
- **Note**: Caddy doesn't expose version by default, but explicit is better

## Backend API Headers (api.birdmaid.{DOMAIN})

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Same as frontend

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Same as frontend

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Same as frontend

### Permissions-Policy
```
Permissions-Policy: geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(),payment=()
```
- **Note**: `fullscreen=()` is empty for API (no iframes needed)

### Content-Security-Policy
```
Content-Security-Policy: default-src 'self'; script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; frame-src 'none';
```
- **Purpose**: Strict CSP for API endpoints
- **Why**: API doesn't serve HTML/JS, so we can be very restrictive
- **Note**: All resources are blocked except same-origin connections

### CORS Headers
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, PUT, OPTIONS, HEAD
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With
Access-Control-Allow-Credentials: true
```
- **Purpose**: Allows cross-origin requests
- **Why**: Frontend needs to access API from different domain
- **Note**: Backend also handles CORS, but Caddy adds headers as well

## Testing Security Headers

### Using curl
```bash
# Test frontend headers
curl -I https://birdmaid.example.com

# Test API headers
curl -I https://api.birdmaid.example.com
```

### Using online tools
- [SecurityHeaders.com](https://securityheaders.com/) - Test your security headers
- [Mozilla Observatory](https://observatory.mozilla.org/) - Comprehensive security scan

### Expected Headers

**Frontend** should include:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: ...`
- `Content-Security-Policy: ...`

**API** should include:
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: ...`
- `Content-Security-Policy: ...`
- `Access-Control-Allow-Origin: *`

## Customizing CSP

If you need to customize the Content-Security-Policy (e.g., for specific CDN domains), edit the `Caddyfile`:

```caddy
# Example: Allow specific CDN domains
Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; img-src 'self' data: https://s3.example.com; frame-src 'self' *;"
```

### CSP Directives Explained

- `default-src 'self'` - Default source is same origin
- `script-src 'self' 'unsafe-inline'` - Scripts from same origin and inline scripts
- `style-src 'self' 'unsafe-inline'` - Styles from same origin and inline styles
- `img-src 'self' data: https:` - Images from same origin, data URIs, and HTTPS
- `font-src 'self' data:` - Fonts from same origin and data URIs
- `frame-src 'self' *` - Frames from same origin and any source (for games)
- `connect-src 'self' https:` - AJAX/fetch requests to same origin and HTTPS

## Security Considerations

1. **CSP and React/Vite**: 
   - Development builds require `'unsafe-inline'` and `'unsafe-eval'`
   - Consider using nonces or hashes for production builds
   - See [Vite CSP guide](https://vitejs.dev/guide/features.html#csp)

2. **Frame Sources**:
   - `frame-src 'self' *` is permissive but necessary for game iframes
   - Consider restricting to specific domains if possible

3. **CORS**:
   - `Access-Control-Allow-Origin: *` allows any origin
   - Consider restricting to specific domains in production

4. **Server Tokens**:
   - Caddy doesn't expose version by default
   - `-Server` header removal is explicit but may not be necessary

## References

- [Caddy Headers Documentation](https://caddyserver.com/docs/caddyfile/directives/header)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
