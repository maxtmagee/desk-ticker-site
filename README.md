# Desk Ticker product site

Static product and support website for the Savannah Dog Industries WiFi stock and crypto ticker.

## Local preview

```powershell
npm install
npm run dev
```

Open the Local URL printed in the terminal.

## Verification

```powershell
npm test
```

The build creates a completely static site in `out/`.

## Render static site

- Build command: `npm ci && npm run build`
- Publish directory: `out`
- Environment variable: `NEXT_PUBLIC_SUPPORT_API_URL=https://savannah-dog.com/api/support`

After `api.savannah-dog.com` is configured, the support endpoint can be changed to `https://api.savannah-dog.com/api/support` and the site rebuilt.

The contact and missing-asset forms submit to the Savannah Dog API. That API requires the Resend and allowed-origin environment variables documented in the API repository's `apiRepo/SUPPORT_EMAIL_SETUP.md` file.
