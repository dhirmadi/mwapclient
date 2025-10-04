# Deployment Guide

**Last Updated:** October 4, 2025  
**Version:** 1.0  
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js:** v18+ (LTS recommended)
- **npm:** v9+ (or yarn/pnpm)
- **Git:** For version control

### Required Services
- **Auth0 Account:** For authentication
- **Backend API:** MWAP Server deployed and accessible
- **SSL Certificates:** For HTTPS (production)

### Required Access
- Auth0 Dashboard access
- Hosting platform credentials
- Backend API endpoint
- DNS configuration access (production)

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Auth0

Get these values from your Auth0 Dashboard:

1. Navigate to **Applications** > **Your Application**
2. Copy the following values:

```bash
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience
```

### 3. Configure API Endpoint

**Development:**
```bash
# Uses Vite proxy to https://mwapss.shibari.photo/api/v1
# No additional configuration needed
```

**Production:**
```bash
# Option 1: Use same proxy pattern (recommended)
# No changes needed, proxy will handle routing

# Option 2: Direct API URL
VITE_API_BASE_URL=https://your-backend-api.com/api/v1
```

### 4. Optional: Error Tracking

For production error tracking with Sentry:

```bash
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production
```

### 5. Environment-Specific Files

Create separate files for each environment:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle with Vite
- Minify code with Terser
- Remove console.log statements
- Generate optimized chunks
- Create `dist/` directory

### 3. Verify Build Output

```bash
ls -lh dist/assets/
```

Expected output:
```
index-[hash].js           # Main entry (~100-200KB)
react-vendor-[hash].js    # React libraries (~150KB)
auth-vendor-[hash].js     # Auth0 (~50KB)
query-vendor-[hash].js    # React Query (~30KB)
mantine-core-[hash].js    # Mantine UI (~200KB)
...
```

### 4. Test Production Build Locally

```bash
npm run preview
```

Visit `https://localhost:4173` to test the production build.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:** Zero-config, automatic HTTPS, CDN, great performance

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Configure environment variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all VITE_* variables

5. Deploy to production:
```bash
vercel --prod
```

**Configuration:** `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://mwapss.shibari.photo/api/v1/$1"
    }
  ]
}
```

### Option 2: Netlify

**Pros:** Simple deployment, automatic builds, great for static sites

**Steps:**

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Configure `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://mwapss.shibari.photo/api/v1/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

5. Deploy:
```bash
netlify deploy --prod
```

### Option 3: AWS S3 + CloudFront

**Pros:** Highly scalable, full control, AWS integration

**Steps:**

1. Build application:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://mwap-client
```

3. Upload dist folder:
```bash
aws s3 sync dist/ s3://mwap-client --delete
```

4. Configure CloudFront distribution
5. Set up SSL certificate (AWS Certificate Manager)
6. Configure API Gateway or proxy for backend API

### Option 4: Docker

**Pros:** Consistent environment, easy to deploy anywhere

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
  location /api/ {
    proxy_pass https://mwapss.shibari.photo/api/v1/;
  }
}
```

**Build and run:**
```bash
docker build -t mwap-client .
docker run -p 80:80 mwap-client
```

---

## Post-Deployment

### 1. Verify Deployment

**Checklist:**
- [ ] Application loads successfully
- [ ] Login works with Auth0
- [ ] API calls succeed
- [ ] All routes accessible
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Proper redirects configured

**Testing:**
```bash
# Check if site is up
curl -I https://your-domain.com

# Check API proxy
curl https://your-domain.com/api/health
```

### 2. Configure DNS

Point your domain to the hosting platform:

**Vercel:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Netlify:**
```
Type: CNAME
Name: @
Value: your-site.netlify.app
```

### 3. Configure Auth0 Callbacks

Update Auth0 Application settings:

**Allowed Callback URLs:**
```
https://your-domain.com,
https://your-domain.com/oauth/callback
```

**Allowed Logout URLs:**
```
https://your-domain.com
```

**Allowed Web Origins:**
```
https://your-domain.com
```

### 4. Set Up Monitoring

**Recommended Tools:**
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics, Plausible
- **Performance:** Vercel Analytics, Web Vitals
- **Uptime:** UptimeRobot, Pingdom

---

## Monitoring

### Performance Monitoring

Use the built-in performance monitoring:

```typescript
// In main.tsx or App.tsx
import { initPerformanceMonitoring } from '@/shared/utils';

if (import.meta.env.PROD) {
  initPerformanceMonitoring();
}
```

This will track:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Error Monitoring

Set up Sentry in production:

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: 0.1,
  });
}
```

### Health Checks

**Endpoint:** `https://your-domain.com/`
**Expected:** Application loads, no errors

**API Health:** `https://your-domain.com/api/health`
**Expected:** 200 OK response

---

## Troubleshooting

### Build Fails

**Error:** `npm run build` fails

**Solutions:**
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm cache clean --force`
3. Check TypeScript errors: `npm run build 2>&1 | grep "error TS"`
4. Verify Node version: `node --version` (should be 18+)

### Auth0 Login Fails

**Error:** "Callback URL mismatch"

**Solutions:**
1. Verify Auth0 Allowed Callback URLs include your domain
2. Check VITE_AUTH0_DOMAIN is correct
3. Ensure HTTPS is enabled
4. Check browser console for detailed error

### API Calls Fail

**Error:** CORS errors or 404 on API calls

**Solutions:**
1. Verify API proxy configuration
2. Check backend is accessible: `curl https://mwapss.shibari.photo/api/v1/health`
3. Verify Auth headers are being sent
4. Check browser network tab for actual request URL

### White Screen in Production

**Error:** App loads blank page

**Solutions:**
1. Check browser console for errors
2. Verify all environment variables are set
3. Check that base path is correct
4. Verify dist files were uploaded correctly
5. Check that index.html is being served for all routes

### Performance Issues

**Problem:** Slow loading times

**Solutions:**
1. Check bundle sizes: `ls -lh dist/assets/`
2. Verify code splitting is working (multiple chunk files)
3. Check CDN/hosting configuration
4. Enable compression (gzip/brotli)
5. Check Performance tab in browser DevTools

---

## Security Checklist

Before production deployment:

- [ ] All environment variables are set
- [ ] .env file is NOT committed to git
- [ ] HTTPS is enabled and enforced
- [ ] Auth0 callbacks are configured correctly
- [ ] CSP headers are configured (server-side)
- [ ] Error messages don't expose sensitive data
- [ ] Source maps are disabled (or protected)
- [ ] Rate limiting is configured (backend)
- [ ] Monitoring is set up (Sentry, etc.)

---

## Rollback Procedure

If deployment fails or issues arise:

### Vercel/Netlify
```bash
# Rollback to previous deployment
vercel rollback
# or
netlify rollback
```

### Manual Rollback
1. Keep previous dist folder as backup
2. Re-upload previous version
3. Verify previous version works
4. Investigate and fix issue
5. Re-deploy

---

## CI/CD Integration

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
          VITE_AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
          VITE_AUTH0_AUDIENCE: ${{ secrets.AUTH0_AUDIENCE }}
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Support

For deployment issues:
- **Documentation:** Check docs in `/docs` folder
- **Issues:** Create GitHub issue
- **Security:** Contact security team directly

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Next Review:** After first production deployment

