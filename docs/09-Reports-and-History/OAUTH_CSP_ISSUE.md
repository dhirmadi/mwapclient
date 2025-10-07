# OAuth CSP Issue - Root Cause Analysis

**Date**: 2025-10-07  
**Status**: ❌ BLOCKED - Backend Configuration Required

## Problem Summary

The OAuth flow creates the integration successfully and initiates OAuth, but the popup does not close after Dropbox redirects back. The root cause is the **backend redirecting to a backend API route instead of the frontend route**.

## Technical Root Cause

### What's Happening:

1. ✅ Frontend creates integration: `POST /api/tenants/.../integrations` → Success
2. ✅ Frontend initiates OAuth: `POST /api/oauth/tenants/.../integrations/.../initiate` → Returns `authorizationUrl`
3. ✅ Popup opens Dropbox authorization page
4. ✅ User authorizes on Dropbox
5. ✅ Dropbox redirects to backend: `https://mwapss.shibari.photo/api/v1/oauth/callback?code=...&state=...`
6. ✅ Backend exchanges code for tokens, stores in integration
7. ❌ **Backend redirects popup to**: `https://mwapss.shibari.photo/api/v1/oauth/success?tenantId=...&integrationId=...` ← **WRONG**
8. ❌ **Backend serves HTML with strict CSP** that blocks JavaScript
9. ❌ React app cannot execute, `postMessage` never fires, popup never closes

### The Core Issue:

Backend is redirecting to **`/api/v1/oauth/success`** (backend API route), but should redirect to **`/oauth/success`** (frontend React route, no `/api` prefix).

**Frontend Routes:**
- ✅ `/oauth/success` - React route that handles success
- ✅ `/oauth/error` - React route that handles errors

**Backend is redirecting to:**
- ❌ `/api/v1/oauth/success` - Backend API endpoint (serves HTML with CSP)
- ❌ `/api/v1/oauth/error` - Backend API endpoint (serves HTML with CSP)

### CSP Error:

```
Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self'". 
Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution.
```

### Why This Happens:

The backend is redirecting to `/oauth/success` **on the backend domain** (`https://mwapss.shibari.photo`), not the **frontend domain** (`https://localhost:5173` in dev, or `https://mwapps.shibari.photo` in prod).

When the backend serves the React app (or any page), it applies its own strict CSP headers, which block:
- Inline scripts (required by Vite dev server and React)
- Cross-origin resources
- Unsafe eval

This prevents the React app from loading and executing the `postMessage` logic.

## Solution: Backend Must Redirect to Frontend Routes

### ⭐ REQUIRED FIX

The backend `/api/v1/oauth/callback` handler must redirect to the **frontend routes** (not backend API routes).

**Current (WRONG):**
```javascript
// Backend redirects to backend API route
res.redirect(`/api/v1/oauth/success?tenantId=${tenantId}&integrationId=${integrationId}`);
//           ^^^^^^^^^ Backend API path - WRONG!
```

**Correct:**
```javascript
// Backend redirects to frontend route
const frontendUrl = process.env.FRONTEND_URL || 'https://mwapps.shibari.photo';
res.redirect(`${frontendUrl}/oauth/success?tenantId=${tenantId}&integrationId=${integrationId}`);
//           ^^^^^^^^^^^^^^^^^^ Frontend origin + frontend route - CORRECT!
```

**Environment Configuration:**

```bash
# Backend .env
FRONTEND_URL=https://localhost:5173  # Dev
# OR
FRONTEND_URL=https://mwapps.shibari.photo  # Production
```

**Complete Backend Implementation:**

```javascript
// In /api/v1/oauth/callback handler

const frontendUrl = process.env.FRONTEND_URL || 'https://mwapps.shibari.photo';

// On success:
res.redirect(`${frontendUrl}/oauth/success?tenantId=${tenantId}&integrationId=${integrationId}`);

// On error:
res.redirect(`${frontendUrl}/oauth/error?message=${encodeURIComponent(errorMessage)}`);
```

**Why This Works:**
1. Popup navigates to frontend origin (e.g., `https://localhost:5173`)
2. Frontend serves React app normally (no CSP issues)
3. React router matches `/oauth/success` route
4. `OAuthCallbackPage` component loads
5. `postMessage` fires to opener
6. Popup closes automatically
7. Main window receives message and navigates to `/integrations`

---

### Option 2: Backend Serves Minimal HTML Callback Page

**Backend Change Required:**

Create a dedicated backend route `/oauth/success` that serves a **minimal HTML page** with relaxed CSP specifically for this callback.

**Backend Route:**

```javascript
app.get('/oauth/success', (req, res) => {
  const { tenantId, integrationId } = req.query;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OAuth Success</title>
</head>
<body>
  <p>Authorization successful. This window will close automatically.</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'oauth_success',
        integrationId: '${integrationId}',
        tenantId: '${tenantId}'
      }, '*');
    }
    setTimeout(() => window.close(), 500);
  </script>
</body>
</html>`;
  
  // Set CSP to allow this inline script
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'");
  res.send(html);
});
```

**Why This Works:**
- Backend controls CSP for this specific route
- Minimal inline script allowed
- No React app loading required

**Downside:**
- Additional backend route
- Less maintainable (HTML in backend code)

---

### Option 3: Use Meta Refresh Instead of JavaScript (Fallback)

If neither of the above is feasible immediately, use a meta refresh to redirect back to frontend:

**Backend Callback HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://localhost:5173/oauth/success?tenantId=...&integrationId=...">
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
```

**Why This Works:**
- No JavaScript required
- No CSP issues
- Browser-native redirect

**Downside:**
- Extra redirect hop
- Slower UX

---

## Quick Fix Summary

### ⭐ ACTUAL ISSUE (Updated)

The backend already has a success page at `/api/v1/oauth/success` that displays a success message. However, this page has a strict CSP that blocks the inline script from executing, preventing it from posting the message to the opener and closing the popup.

### Backend Changes Required:

**Option A: Allow Inline Script on Success Page (SIMPLEST)** ⭐

Update the `/api/v1/oauth/success` handler to:
1. Set CSP to allow inline scripts
2. Add script to post message and close popup

```javascript
app.get('/api/v1/oauth/success', (req, res) => {
  const { tenantId, integrationId } = req.query;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OAuth Success</title>
</head>
<body>
  <h1>✓ OAuth Integration Successful!</h1>
  <p>Your cloud provider has been successfully connected to your account.</p>
  <p>Integration ID: ${integrationId}</p>
  <p>This window will close automatically.</p>
  
  <script>
    (function() {
      console.log('[Backend Success] Posting message to opener');
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_success',
          integrationId: '${integrationId}',
          tenantId: '${tenantId}'
        }, '*');
      }
      setTimeout(() => window.close(), 500);
    })();
  </script>
</body>
</html>`;
  
  // CRITICAL: Allow inline script for this specific page
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'");
  res.send(html);
});
```

**Option B: Auto-Redirect to Frontend**

Add a meta refresh to redirect to the frontend React route:

```javascript
app.get('/api/v1/oauth/success', (req, res) => {
  const { tenantId, integrationId } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'https://mwapps.shibari.photo';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OAuth Success</title>
  <meta http-equiv="refresh" content="1;url=${frontendUrl}/oauth/success?tenantId=${tenantId}&integrationId=${integrationId}">
</head>
<body>
  <h1>✓ OAuth Integration Successful!</h1>
  <p>Redirecting to your application...</p>
</body>
</html>`;
  
  res.send(html);
});
```

**Recommendation**: Use **Option A** (simpler, faster, no frontend redirect needed).

### Frontend Changes:

✅ **No changes required** - the existing implementation will work once backend redirects to frontend origin.

---

## Current Status

- ❌ **Blocked**: Waiting for backend changes
- ✅ Frontend implementation is complete and correct
- ✅ All frontend code is CSP-compliant
- ❌ Backend is redirecting to wrong origin (backend instead of frontend)

---

## Testing After Fix

Once backend is updated, test:

1. Create new integration
2. Authorize on Dropbox
3. Verify popup redirects to **`https://localhost:5173/oauth/success?...`** (dev) or **`https://mwapps.shibari.photo/oauth/success?...`** (prod)
4. Check browser console for:
   - ✅ No CSP violations
   - ✅ `[Callback] OAuthCallbackPage mounted`
   - ✅ `[Callback] Posting success message`
   - ✅ `[Opener] Received postMessage`
5. Verify popup auto-closes
6. Verify main window navigates to `/integrations`
7. Verify integration appears with `status: 'active'`

---

## Related Files

- Frontend: `src/pages/OAuthCallbackPage.tsx`
- Frontend: `src/features/integrations/components/OAuthButton.tsx`
- Backend: OAuth callback handler (needs update)
- Backend: Environment configuration (needs `FRONTEND_URL`)

---

## Priority

**HIGH** - This blocks all cloud provider integrations from functioning.

