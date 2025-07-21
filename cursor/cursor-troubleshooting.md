# 🔧 MWAP Client - Troubleshooting Guide for Cursor AI

## 🚨 Cloud Provider Integration Issues

### Issue: "Provider is currently unavailable"
**Symptoms:**
- Orange alert message: "This provider is currently unavailable. Please try again later."
- "Connect Dropbox" button is disabled
- OAuth flow cannot be initiated

**Root Cause:**
```typescript
// In OAuthButton.tsx line 145
const isButtonDisabled = disabled || !provider.isActive || isLoading;

// In OAuthButton.tsx lines 322-332
{!provider.isActive && (
  <Alert color="orange">
    This provider is currently unavailable. Please try again later.
  </Alert>
)}
```

**Investigation Steps:**
1. Check provider data in browser DevTools:
   ```javascript
   // In browser console
   console.log('Provider data:', provider);
   console.log('isActive status:', provider.isActive);
   ```

2. Verify database state:
   ```sql
   SELECT id, name, isActive, type FROM cloud_providers WHERE name = 'Dropbox';
   ```

3. Check admin interface status display:
   - Navigate to `/admin/cloud-providers`
   - Note hardcoded "Active" badge vs. real status

**Solutions:**
1. **Immediate Fix** - Database update:
   ```sql
   UPDATE cloud_providers 
   SET isActive = true, type = 'dropbox' 
   WHERE name = 'Dropbox';
   ```

2. **Admin Interface Fix** - Add isActive toggle:
   ```typescript
   // In CloudProviderEditPage.tsx
   <Switch
     label="Active"
     description="Enable this provider for integrations"
     {...form.getInputProps('isActive', { type: 'checkbox' })}
   />
   ```

3. **Type Definition Fix**:
   ```typescript
   // In cloud-provider.types.ts
   export interface CloudProviderUpdate {
     // ... existing fields
     isActive?: boolean;  // ADD THIS
     type?: string;       // ADD THIS
   }
   ```

### Issue: OAuth Flow Fails After Provider Activation
**Symptoms:**
- Provider shows as available
- OAuth button is enabled
- Redirect fails or returns error

**Investigation Steps:**
1. Check OAuth configuration:
   ```typescript
   console.log('OAuth config:', {
     clientId: provider.clientId,
     authUrl: provider.authUrl,
     scopes: provider.scopes
   });
   ```

2. Verify PKCE implementation:
   ```typescript
   // Check code_challenge generation
   console.log('PKCE challenge:', codeChallenge);
   console.log('Code verifier:', codeVerifier);
   ```

3. Monitor network requests:
   - Open DevTools Network tab
   - Look for failed OAuth requests
   - Check response status and error messages

**Common Solutions:**
- Verify OAuth client credentials are correct
- Check redirect URI configuration
- Ensure PKCE parameters are properly generated
- Validate OAuth scopes match provider requirements

## 🔐 Authentication Issues

### Issue: "Authenticating..." Loop
**Symptoms:**
- App shows "Authenticating..." indefinitely
- Debug panel shows `isLoading: true, isAuthenticated: false`
- No error messages displayed

**Investigation Steps:**
1. Check Auth0 configuration:
   ```typescript
   // Verify environment variables
   console.log('Auth0 config:', {
     domain: import.meta.env.VITE_AUTH0_DOMAIN,
     clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
     audience: import.meta.env.VITE_AUTH0_AUDIENCE
   });
   ```

2. Check browser console for Auth0 errors:
   ```javascript
   // Look for Auth0 SDK errors
   // Check for CORS issues
   // Verify callback URL configuration
   ```

3. Verify token storage:
   ```javascript
   // Check localStorage
   console.log('Auth token:', localStorage.getItem('auth_token'));
   ```

**Solutions:**
1. **Environment Variables** - Ensure all Auth0 variables are set:
   ```env
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-audience
   ```

2. **Auth0 Configuration** - Verify callback URLs:
   - Add `http://localhost:5173` to allowed callback URLs
   - Add `http://localhost:5173` to allowed origins

3. **Clear Auth State**:
   ```javascript
   // Clear localStorage
   localStorage.clear();
   // Reload page
   window.location.reload();
   ```

### Issue: Role-Based Access Not Working
**Symptoms:**
- User authenticated but sees wrong interface
- Permission errors when accessing features
- Role checks returning incorrect values

**Investigation Steps:**
1. Check user roles:
   ```typescript
   const { roles, user } = useAuth();
   console.log('User roles:', roles);
   console.log('User data:', user);
   ```

2. Verify API role endpoint:
   ```javascript
   // Check network tab for /api/v1/users/me/roles
   // Verify response format and data
   ```

3. Test role checking logic:
   ```typescript
   const { isSuperAdmin, isTenantOwner } = useRoleAccess();
   console.log('Role checks:', { isSuperAdmin, isTenantOwner });
   ```

**Solutions:**
1. **API Response Format** - Ensure roles API returns correct format:
   ```json
   {
     "success": true,
     "data": [
       {
         "role": "SUPER_ADMIN",
         "tenantId": null
       }
     ]
   }
   ```

2. **Role Context Update** - Refresh role data:
   ```typescript
   // Force role refresh
   queryClient.invalidateQueries(['user-roles']);
   ```

## 🌐 API Integration Issues

### Issue: API Calls Failing with 404/500 Errors
**Symptoms:**
- Network errors in browser console
- API endpoints returning 404 or 500 status
- Data not loading in components

**Investigation Steps:**
1. Check API base URL configuration:
   ```typescript
   // In src/shared/utils/api.ts
   console.log('API base URL:', apiClient.defaults.baseURL);
   ```

2. Verify Vite proxy configuration:
   ```typescript
   // In vite.config.ts - DO NOT MODIFY
   server: {
     proxy: {
       '/api': {
         target: 'https://mwapss.shibari.photo/api/v1',
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api/, '')
       }
     }
   }
   ```

3. Check network requests:
   - Open DevTools Network tab
   - Look for failed API requests
   - Check request URLs and response status

**Solutions:**
1. **Verify Backend Status** - Check if backend is running:
   ```bash
   curl https://mwapss.shibari.photo/api/v1/health
   ```

2. **Check Request Format** - Ensure proper API call format:
   ```typescript
   // Correct format
   const response = await apiClient.get('/tenants');
   // This becomes: https://mwapss.shibari.photo/api/v1/tenants
   ```

3. **Authentication Headers** - Verify token is included:
   ```typescript
   // Check request headers in DevTools
   Authorization: Bearer <token>
   ```

### Issue: React Query Cache Issues
**Symptoms:**
- Stale data displayed after updates
- Changes not reflected immediately
- Inconsistent data across components

**Investigation Steps:**
1. Check React Query DevTools:
   ```typescript
   // Install React Query DevTools
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   
   // Add to App.tsx
   <ReactQueryDevtools initialIsOpen={false} />
   ```

2. Verify cache invalidation:
   ```typescript
   // Check if mutations invalidate queries
   onSuccess: () => {
     queryClient.invalidateQueries(['resource']);
   }
   ```

3. Check query keys consistency:
   ```typescript
   // Ensure query keys match across hooks
   queryKey: ['tenants', filters] // Must be consistent
   ```

**Solutions:**
1. **Manual Cache Invalidation**:
   ```typescript
   queryClient.invalidateQueries(['resource']);
   queryClient.refetchQueries(['resource']);
   ```

2. **Optimistic Updates**:
   ```typescript
   onMutate: async (newData) => {
     await queryClient.cancelQueries(['resource']);
     const previousData = queryClient.getQueryData(['resource']);
     queryClient.setQueryData(['resource'], newData);
     return { previousData };
   }
   ```

## 🎨 UI/UX Issues

### Issue: Mantine Components Not Styling Correctly
**Symptoms:**
- Components appear unstyled or with default browser styles
- Mantine theme not applied
- Icons not displaying

**Investigation Steps:**
1. Check Mantine provider setup:
   ```typescript
   // In App.tsx or main.tsx
   import { MantineProvider } from '@mantine/core';
   import '@mantine/core/styles.css';
   ```

2. Verify CSS imports:
   ```typescript
   // Check if Mantine CSS is imported
   import '@mantine/core/styles.css';
   import '@mantine/notifications/styles.css';
   ```

3. Check for CSS conflicts:
   ```css
   /* Look for conflicting global styles */
   /* Check Tailwind CSS conflicts */
   ```

**Solutions:**
1. **Proper CSS Import Order**:
   ```typescript
   // In main.tsx - correct order
   import '@mantine/core/styles.css';
   import '@mantine/notifications/styles.css';
   import './index.css'; // Your custom styles last
   ```

2. **Theme Configuration**:
   ```typescript
   <MantineProvider theme={{
     primaryColor: 'blue',
     fontFamily: 'Inter, sans-serif'
   }}>
     <App />
   </MantineProvider>
   ```

### Issue: Responsive Design Problems
**Symptoms:**
- Layout breaks on mobile devices
- Components overflow on small screens
- Touch interactions not working

**Investigation Steps:**
1. Test different screen sizes:
   ```javascript
   // Use browser DevTools device emulation
   // Test breakpoints: xs, sm, md, lg, xl
   ```

2. Check Mantine responsive props:
   ```typescript
   // Verify responsive prop usage
   <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
   ```

3. Verify viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

**Solutions:**
1. **Use Mantine Responsive System**:
   ```typescript
   <Group
     justify={{ base: 'center', md: 'space-between' }}
     gap={{ base: 'sm', md: 'md' }}
   >
   ```

2. **Mobile-First Approach**:
   ```typescript
   // Start with mobile styles, add larger breakpoints
   <Button
     size={{ base: 'sm', md: 'md' }}
     fullWidth={{ base: true, md: false }}
   >
   ```

## 🧪 Development Environment Issues

### Issue: TypeScript Compilation Errors
**Symptoms:**
- Red squiggly lines in editor
- Build failures with TypeScript errors
- Type checking failures

**Investigation Steps:**
1. Check TypeScript configuration:
   ```json
   // In tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

2. Verify type imports:
   ```typescript
   // Check if types are properly imported
   import type { ComponentProps } from 'react';
   ```

3. Run type checking:
   ```bash
   npm run type-check
   ```

**Solutions:**
1. **Fix Type Imports**:
   ```typescript
   // Use proper type imports
   import type { FC } from 'react';
   import type { ButtonProps } from '@mantine/core';
   ```

2. **Update Type Definitions**:
   ```typescript
   // Ensure interfaces match API responses
   interface ApiResponse<T> {
     success: boolean;
     data: T;
     error?: string;
   }
   ```

### Issue: Hot Reload Not Working
**Symptoms:**
- Changes not reflected in browser
- Need to manually refresh page
- Development server issues

**Investigation Steps:**
1. Check Vite configuration:
   ```typescript
   // In vite.config.ts
   server: {
     host: true,
     port: 5173
   }
   ```

2. Verify file watching:
   ```bash
   # Check if files are being watched
   # Look for file system permission issues
   ```

**Solutions:**
1. **Restart Development Server**:
   ```bash
   npm run dev
   ```

2. **Clear Cache**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## 🔍 Debugging Tools and Techniques

### Browser DevTools Usage
1. **React Developer Tools**:
   - Install React DevTools extension
   - Inspect component props and state
   - Profile component performance

2. **Network Tab**:
   - Monitor API requests and responses
   - Check request headers and status codes
   - Verify request/response data format

3. **Console Debugging**:
   ```typescript
   // Strategic console.log placement
   console.log('Component props:', props);
   console.log('API response:', response.data);
   console.log('User roles:', roles);
   ```

### React Query DevTools
```typescript
// Add to development environment
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}
```

### Debug Panel Usage
The MWAP Client includes a debug panel accessible via the floating debug button:
- **Authentication State**: View current auth status and roles
- **Local Storage**: Check stored tokens and data
- **Environment**: Verify environment variables
- **Actions**: Force authentication states for testing

### Performance Debugging
1. **React Profiler**:
   ```typescript
   import { Profiler } from 'react';
   
   <Profiler id="ComponentName" onRender={onRenderCallback}>
     <ComponentToProfile />
   </Profiler>
   ```

2. **Bundle Analysis**:
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

This troubleshooting guide covers the most common issues encountered in MWAP Client development and provides systematic approaches to diagnosis and resolution.