# API Configuration Documentation

## Overview
This document outlines the critical API configuration for the MWAP Client application, including Vite proxy setup and API client configuration.

## ⚠️ CRITICAL CONFIGURATION REQUIREMENTS

### API Base URL Configuration
**File:** `src/shared/utils/api.ts` (Line 20)
```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',  // ← MUST remain '/api' - DO NOT CHANGE
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});
```

### Vite Proxy Configuration
**File:** `vite.config.ts` (Lines 23-30)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://mwapss.shibari.photo/api/v1',  // ← Backend server
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),  // ← Removes /api prefix
    },
  },
}
```

## API Request Flow

### Step-by-Step Process
1. **Frontend Request:** Application makes API call using `/api` base URL
   ```typescript
   api.get('/users/me/roles')  // Becomes: /api/users/me/roles
   ```

2. **Vite Proxy Intercept:** Development server intercepts `/api/*` requests
   - Matches pattern: `/api/users/me/roles`
   - Target server: `https://mwapss.shibari.photo/api/v1`

3. **URL Rewriting:** Proxy removes `/api` prefix from path
   - Original: `/api/users/me/roles`
   - Rewritten: `/users/me/roles`

4. **Backend Request:** Final request sent to backend
   ```
   https://mwapss.shibari.photo/api/v1/users/me/roles
   ```

5. **Response Processing:** Backend returns wrapped response
   ```json
   {
     "success": true,
     "data": {
       "isSuperAdmin": true,
       "isTenantOwner": false,
       "userId": "google-oauth2|123456789",
       "tenantId": "tenant-id",
       "projectRoles": []
     }
   }
   ```

## Configuration Sources

### Referenced Files
- **API Client:** `src/shared/utils/api.ts` - Axios instance configuration
- **Vite Config:** `vite.config.ts` - Development server proxy setup
- **Auth Context:** `src/core/context/AuthContext.tsx` - API usage examples

### Backend Integration
- **Target Server:** `https://mwapss.shibari.photo/api/v1`
- **API Version:** v1 (as configured in proxy target)
- **Response Format:** Wrapped responses with `{success: boolean, data: T}` structure

## Common Issues and Solutions

### ❌ Incorrect Configurations (DO NOT USE)
```typescript
// WRONG - Direct backend URL
baseURL: 'https://mwapss.shibari.photo/api/v1'

// WRONG - Missing /api prefix
baseURL: '/'

// WRONG - Incorrect proxy target
target: 'https://mwapss.shibari.photo'
```

### ✅ Correct Configuration (CURRENT SETUP)
```typescript
// API Client (src/shared/utils/api.ts)
baseURL: '/api'

// Vite Proxy (vite.config.ts)
'/api': {
  target: 'https://mwapss.shibari.photo/api/v1',
  rewrite: (path) => path.replace(/^\/api/, '')
}
```

## Why This Configuration is Required

### Development Environment
- **Proxy Necessity:** Avoids CORS issues during development
- **URL Consistency:** Maintains same API paths in dev and production
- **Backend Integration:** Properly routes to versioned API endpoints

### Production Considerations
- **Build Process:** Production builds will need proper API routing
- **Environment Variables:** May require different configuration for production
- **CORS Handling:** Backend must handle CORS for production deployment

## Troubleshooting

### Network Request Debugging
1. **Check Browser Network Tab:** Verify requests go to `/api/*` paths
2. **Vite Proxy Logs:** Development server shows proxy forwarding
3. **Backend Logs:** Confirm requests reach backend with correct paths

### Common Error Patterns
- **404 Errors:** Usually indicate proxy configuration issues
- **CORS Errors:** May indicate missing proxy or incorrect target
- **Network Errors:** Could indicate backend server unavailability

## Maintenance Notes

### When NOT to Change Configuration
- ❌ API calls are working correctly
- ❌ Authentication is functioning properly  
- ❌ Role processing is working as expected
- ❌ No specific requirement to change backend integration

### When Configuration Changes May Be Needed
- ✅ Backend server URL changes
- ✅ API version updates (v1 → v2)
- ✅ Production deployment requirements
- ✅ CORS policy changes

## References

### Source Code References
- **Vite Configuration:** `vite.config.ts` lines 23-30
- **API Client Setup:** `src/shared/utils/api.ts` line 20
- **Usage Examples:** `src/core/context/AuthContext.tsx` line 185

### External Documentation
- **Vite Proxy Documentation:** https://vitejs.dev/config/server-options.html#server-proxy
- **Axios Configuration:** https://axios-http.com/docs/config_defaults

---

**⚠️ IMPORTANT:** This configuration has been tested and verified to work correctly. Changes should only be made with thorough testing and understanding of the full request flow.