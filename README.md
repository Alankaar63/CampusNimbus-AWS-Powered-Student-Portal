# CampusNimbus - AWS Powered Student Portal

Frontend for an AWS-backed student portal (Cognito + API Gateway + Lambda + DynamoDB + S3), deployed on GitHub Pages.

## Local run

```bash
npm install
npm run dev -- --port 5173
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

This repo is already configured for GitHub Pages:

- `HashRouter` is enabled.
- Vite `base` is set to `/CampusNimbus-AWS-Powered-Student-Portal/` in production.
- Workflow: `.github/workflows/deploy.yml`.

### One-time GitHub setup

1. Go to repository `Settings` -> `Pages`.
2. Set source to `GitHub Actions`.
3. Go to `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`.
4. Add these variables:
   - `VITE_API_BASE_URL`
   - `VITE_COGNITO_DOMAIN`
   - `VITE_COGNITO_CLIENT_ID`
   - `VITE_COGNITO_REDIRECT_URI`
   - `VITE_AWS_REGION`
   - `VITE_REPORT_BUCKET` (if needed)
5. Push to `main` to trigger deployment.

Live URL:

`https://alankaar63.github.io/CampusNimbus-AWS-Powered-Student-Portal/`

## Cognito Hosted UI callback URL

Add this callback in Cognito app client:

`https://alankaar63.github.io/CampusNimbus-AWS-Powered-Student-Portal/#/callback`

Also add sign-out URL:

`https://alankaar63.github.io/CampusNimbus-AWS-Powered-Student-Portal/`
