# Token Refresh Issue Analysis

**Date:** October 8, 2025  
**Issue:** Refresh token endpoint returns 400 "Refresh token is invalid or expired"  
**Status:** Backend issue - requires backend investigation and fix

---

## Executive Summary

The frontend is correctly calling the backend token refresh endpoint, but the backend is rejecting the request with a 400 error indicating the refresh token is invalid or expired. This is a backend data/configuration issue, not a frontend code issue.

---

## Issue Details

### Frontend Request (Correct)
```
POST /api/tenants/68542c26b65db0b43fe6e552/integrations/68e65a827120ff4f9b8ceb33/refresh-token
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json
```

### Backend Response (Error)
```json
HTTP 400 Bad Request

{
  "success": false,
  "error": {
    "code": "server/internal-error",
    "message": "Refresh token is invalid or expired"
  }
}
```

### Evidence Request Reaches Backend
- Response headers include backend's CSP: `"default-src 'self';base-uri 'self';font-src 'self'..."`
- Response includes `access-control-allow-origin: 'https://localhost:5173'` (backend CORS)
- 400 status is a backend validation error, not a proxy/network error

---

## Root Cause Analysis

### 1. Frontend Verification (✅ All Correct)

| Check | Status | Evidence |
|-------|--------|----------|
| Correct endpoint | ✅ | `/api/tenants/{tenantId}/integrations/{integrationId}/refresh-token` |
| Valid JWT auth | ✅ | `Authorization: Bearer` header present with 923-char JWT |
| Proper API client | ✅ | Using `api.ts` with Vite proxy to backend |
| Request reaches backend | ✅ | 400 response with backend CSP/CORS headers |
| Error handling | ✅ | Frontend correctly processes error and shows notification |

**Conclusion:** Frontend implementation is correct and working as designed.

### 2. Backend Investigation Required (❌ Issue Here)

The backend is returning "Refresh token is invalid or expired", which indicates one of these backend issues:

#### A. Refresh Token Not Stored During OAuth Callback
**Symptom:** Integration has `accessToken` but no `refreshToken` in database.

**Check:**
```javascript
// Query the integration document in MongoDB
db.integrations.findOne({ _id: ObjectId("68e65a827120ff4f9b8ceb33") })

// Verify these fields exist:
{
  refreshToken: "...",  // Should be encrypted string
  tokenExpiresAt: Date,
  scopes: [...],
  oauth: {
    status: "completed",
    // ...
  }
}
```

**Fix if missing:** The OAuth callback handler is not properly extracting/storing the refresh token from the provider's token exchange response.

#### B. Dropbox Configuration Missing `token_access_type=offline`
**Symptom:** Dropbox returned a short-lived or missing refresh token during OAuth.

**Check:** Review the initiate endpoint's authorization URL construction:
```javascript
// Should include:
const authUrl = `${provider.authUrl}?` +
  `client_id=${provider.clientId}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&state=${state}` +
  `&code_challenge=${pkceChallenge}` +
  `&code_challenge_method=S256` +
  `&scope=${encodeURIComponent(scopes.join(' '))}` +
  `&token_access_type=offline`;  // ⚠️ THIS IS REQUIRED FOR DROPBOX
```

**Fix if missing:** Add `token_access_type=offline` parameter to Dropbox authorization URL to request long-lived refresh tokens.

**Reference:** [Dropbox OAuth Guide - Offline Access](https://developers.dropbox.com/oauth-guide#offline-access)

#### C. Refresh Token Encryption/Decryption Failure
**Symptom:** Refresh token exists in database but cannot be decrypted.

**Check:**
1. Verify `ENCRYPTION_KEY` environment variable hasn't changed since integration was created
2. Check backend logs for decryption errors during refresh attempt
3. Test encryption/decryption utility:
```javascript
const encrypted = encryptToken(testToken);
const decrypted = decryptToken(encrypted);
assert(decrypted === testToken);
```

**Fix if broken:** 
- Restore original encryption key
- Or implement key rotation with versioned encryption
- Re-authenticate integrations created with old key

#### D. Dropbox Refresh Token Actually Expired/Revoked
**Symptom:** Backend has valid refresh token but Dropbox rejects it.

**Check backend logs for Dropbox API response:**
```
POST https://api.dropboxapi.com/oauth2/token
Response: 400 { "error": "invalid_grant" }
```

**Possible causes:**
- User revoked app access in Dropbox settings
- Refresh token expired (Dropbox refresh tokens don't expire unless `token_access_type=offline` is missing)
- App credentials changed in Dropbox App Console

**Fix:** 
- User must re-authenticate (trigger new OAuth flow)
- Frontend should detect this error and show "Re-authenticate" button
- Backend should mark integration status as `needs_reauth`

---

## Backend Action Items

### Priority 1: Immediate Investigation
1. **Check database for refresh token:**
   ```bash
   db.integrations.findOne(
     { _id: ObjectId("68e65a827120ff4f9b8ceb33") },
     { refreshToken: 1, tokenExpiresAt: 1, oauth: 1 }
   )
   ```

2. **Check backend logs for actual error:**
   ```bash
   # Look for logs around 2025-10-08T12:36:30.718Z
   grep "refresh-token" backend.log | grep "68e65a827120ff4f9b8ceb33"
   ```

3. **Test refresh token manually:**
   ```bash
   curl -X POST "https://api.dropboxapi.com/oauth2/token" \
     -d "grant_type=refresh_token" \
     -d "refresh_token=<DECRYPTED_REFRESH_TOKEN>" \
     -d "client_id=b9oc85cjp139eph" \
     -d "client_secret=<CLIENT_SECRET>"
   ```

### Priority 2: Fix Implementation
Based on investigation results:

**If refresh token is missing:**
- Fix OAuth callback handler to store refresh token
- Code location: `/api/v1/oauth/callback` handler

**If `token_access_type=offline` is missing:**
- Add parameter to authorization URL in initiate endpoint
- Code location: `POST /api/v1/oauth/tenants/{tenantId}/integrations/{integrationId}/initiate`

**If decryption is failing:**
- Fix encryption utility
- Consider key rotation implementation

**If Dropbox rejected token:**
- Implement re-authentication flow
- Add `needs_reauth` status to integration
- Return specific error code to frontend

### Priority 3: Documentation Update
Update `/docs/04-Backend/api-reference.md`:

```markdown
### Refresh Integration Token
Manually refresh OAuth tokens for an integration.

**Endpoint:** `POST /api/v1/tenants/:tenantId/integrations/:integrationId/refresh-token`  
**Authentication:** Required  
**Authorization:** Tenant owner

**Request:**
No body required.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "68e65a827120ff4f9b8ceb33",
    "tenantId": "68542c26b65db0b43fe6e552",
    "providerId": "68550f580c60d54d0eaf4373",
    "status": "active",
    "tokenExpiresAt": "2025-10-08T16:36:30.000Z",
    // ... other integration fields (tokens are never returned)
  }
}
```

**Error Responses:**

| Code | Status | Description | Frontend Action |
|------|--------|-------------|-----------------|
| `auth/unauthorized` | 401 | Invalid or missing JWT | Redirect to login |
| `auth/forbidden` | 403 | User doesn't own tenant | Show error |
| `resource/not-found` | 404 | Integration not found | Remove from UI |
| `oauth/refresh-token-missing` | 400 | No refresh token stored | Show "Re-authenticate" button |
| `oauth/refresh-token-expired` | 400 | Refresh token expired/revoked | Show "Re-authenticate" button |
| `oauth/provider-error` | 502 | Provider API error | Show "Try again later" |
```

---

## Frontend Recommendations

While the frontend is working correctly, these improvements would enhance UX:

### 1. Better Error Handling for Re-authentication
```typescript
// In IntegrationCard.tsx handleRefresh:
catch (error) {
  const errorCode = error?.response?.data?.error?.code;
  
  if (errorCode === 'oauth/refresh-token-expired' || 
      errorCode === 'oauth/refresh-token-missing') {
    // Show re-authenticate button instead of generic error
    setShowReauthModal(true);
  } else {
    console.error('Failed to refresh token:', error);
  }
}
```

### 2. Add "Re-authenticate" Modal/Button
When refresh fails with token error:
```tsx
<Modal opened={showReauthModal} onClose={() => setShowReauthModal(false)}>
  <Text>Your {provider.name} connection has expired and needs to be re-authenticated.</Text>
  <Button onClick={() => navigate(`/integrations/${integration.id}/reconnect`)}>
    Re-authenticate
  </Button>
</Modal>
```

### 3. Detect Token Expiry Proactively
```typescript
// In useTokenManagement.ts or IntegrationCard:
useEffect(() => {
  if (integration.tokenExpiresAt) {
    const expiresAt = new Date(integration.tokenExpiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt - now) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 1) {
      // Show warning: "Token expires in < 1 hour"
      // Auto-trigger refresh if < 10 minutes
      if (hoursUntilExpiry < 0.17) { // 10 minutes
        refreshToken(integration.id);
      }
    }
  }
}, [integration.tokenExpiresAt]);
```

---

## Test Plan (Backend)

### Unit Tests
1. Test OAuth callback stores refresh token correctly
2. Test encryption/decryption of refresh token
3. Test refresh endpoint with valid refresh token
4. Test refresh endpoint with missing refresh token
5. Test refresh endpoint with expired refresh token
6. Test refresh endpoint returns sanitized integration (no tokens)

### Integration Tests
1. Full OAuth flow → verify refresh token stored
2. Call refresh endpoint → verify new access token
3. Simulate Dropbox rejecting refresh token → verify error handling
4. Test with encryption key rotation

### Manual Tests
1. Complete OAuth flow for Dropbox integration
2. Wait 1 hour (or manually expire token in DB)
3. Click "Refresh" button in frontend
4. Verify new token received and integration remains active
5. Revoke app in Dropbox settings
6. Click "Refresh" → should return "needs reauth" error

---

## Conclusion

**The frontend is working correctly.** The issue is in the backend's:
1. OAuth callback token storage
2. Dropbox configuration (`token_access_type=offline` parameter)
3. Token encryption/decryption
4. Or error handling/reporting

**Next Step:** Backend team to investigate database state and logs, then implement appropriate fix based on findings above.

---

## References

- Dropbox OAuth Guide: https://developers.dropbox.com/oauth-guide
- Dropbox Token Endpoint: https://www.dropbox.com/developers/documentation/http/documentation#oauth2-token
- Backend Migration Doc: `/docs/09-Reports-and-History/BACKEND_DRIVEN_OAUTH_MIGRATION.md`
- API Reference: `/docs/04-Backend/api-reference.md`

