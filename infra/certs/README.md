# Dev TLS certs (Godot Secure Context)

Godot Web export requires HTTPS (Secure Context). Run once before first `docker compose up`:

```bash
./infra/certs/generate.sh
```

Creates `cert.pem` and `key.pem` (self-signed, SAN: shell.local, api.shell.local, s3.shell.local).
Then use **https://shell.local** for Godot user apps.
