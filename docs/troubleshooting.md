# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### Issue: "Login button not working"
**Symptoms**: Clicking login button does nothing or shows error
**Possible Causes**:
- Missing or incorrect Auth0 environment variables
- Auth0 application not configured correctly
- Network connectivity issues

**Solutions**:
1. Verify environment variables in `.env.local`:
   ```env
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-audience
   ```

2. Check Auth0 dashboard configuration:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`

3. Clear browser cache and cookies

#### Issue: "Role-based UI elements not showing"
**Symptoms**: SuperAdmin panels or tenant-specific features not displaying
**Root Cause**: Authentication race condition

**Solution**: Always check `isReady` state before role-based rendering:
```typescript
const MyComponent = () => {
  const { isReady, isSuperAdmin } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {isSuperAdmin && <AdminPanel />}
    </div>
  );
};
```

#### Issue: "Token refresh failures"
**Symptoms**: User gets logged out unexpectedly or API calls fail with 401
**Solutions**:
1. Check Auth0 refresh token settings
2. Verify token expiration times
3. Ensure `useRefreshTokens={true}` in Auth0Provider

### API Issues

#### Issue: "API calls returning 404 errors"
**Symptoms**: All API calls fail with 404 Not Found
**Root Cause**: Vite proxy configuration issue

**Solution**: Verify `vite.config.ts` proxy configuration (DO NOT MODIFY):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://mwapss.shibari.photo/api/v1',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

#### Issue: "CORS errors in development"
**Symptoms**: Browser console shows CORS policy errors
**Solutions**:
1. Ensure Vite proxy is configured correctly
2. Check that development server is running on correct port
3. Verify backend CORS configuration

#### Issue: "API responses not handled correctly"
**Symptoms**: Data not displaying or errors in console about response format
**Root Cause**: Backend wraps responses in `{success: true, data: {...}}` format

**Solution**: Use the configured API client that handles response unwrapping:
```typescript
// ✅ Correct - uses configured API client
const { data } = await api.get('/projects');

// ❌ Incorrect - direct axios call
const response = await axios.get('/api/projects');
```

### Development Server Issues

#### Issue: "Development server won't start"
**Symptoms**: `npm run dev` fails or server crashes
**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version (requires v18+):
   ```bash
   node --version
   ```

3. Verify port 5173 is available:
   ```bash
   lsof -i :5173
   ```

#### Issue: "Hot module replacement not working"
**Symptoms**: Changes not reflected in browser without manual refresh
**Solutions**:
1. Check file watching limits (Linux/macOS):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. Ensure files are saved properly
3. Check browser console for errors

### Build Issues

#### Issue: "Build fails with TypeScript errors"
**Symptoms**: `npm run build` fails with type errors
**Solutions**:
1. Run type checking separately:
   ```bash
   npm run type-check
   ```

2. Fix TypeScript errors one by one
3. Ensure all imports have proper types

#### Issue: "Build succeeds but app doesn't work in production"
**Symptoms**: Production build loads but features don't work
**Solutions**:
1. Check environment variables for production
2. Verify API endpoints are accessible from production domain
3. Check browser console for errors

### Component Issues

#### Issue: "Components not rendering correctly"
**Symptoms**: UI elements missing or styled incorrectly
**Solutions**:
1. Check component imports:
   ```typescript
   // ✅ Correct
   import { Button } from '@/shared/components/atoms/Button';
   
   // ❌ Incorrect
   import Button from './Button';
   ```

2. Verify Mantine theme provider is configured
3. Check CSS imports and Tailwind configuration

#### Issue: "State not updating correctly"
**Symptoms**: UI not reflecting state changes
**Solutions**:
1. Check React Query cache invalidation
2. Verify useEffect dependencies
3. Ensure proper state management patterns

### Performance Issues

#### Issue: "App loading slowly"
**Symptoms**: Long initial load times or sluggish interactions
**Solutions**:
1. Check bundle size:
   ```bash
   npm run build
   npm run preview
   ```

2. Implement code splitting for large components
3. Optimize images and assets
4. Check React Query cache configuration

#### Issue: "Memory leaks"
**Symptoms**: Browser memory usage increasing over time
**Solutions**:
1. Check for unsubscribed event listeners
2. Verify useEffect cleanup functions
3. Review React Query cache settings

### Testing Issues

#### Issue: "Tests failing unexpectedly"
**Symptoms**: Previously passing tests now fail
**Solutions**:
1. Clear test cache:
   ```bash
   npm run test -- --clearCache
   ```

2. Check for async/await issues in tests
3. Verify test environment setup

#### Issue: "Mock functions not working"
**Symptoms**: Mocked API calls or functions not behaving as expected
**Solutions**:
1. Verify mock setup in test files
2. Check mock implementation
3. Ensure proper cleanup between tests

## Debugging Tools

### Browser Developer Tools
1. **Network Tab**: Monitor API calls and responses
2. **Console**: Check for JavaScript errors and warnings
3. **Application Tab**: Inspect localStorage, sessionStorage, and cookies
4. **React Developer Tools**: Debug React component state and props

### Development Debugging
```typescript
// Enable debug logging
if (import.meta.env.DEV) {
  console.log('Debug info:', { user, roles, isReady });
}

// API request/response logging
apiClient.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});
```

### Performance Debugging
```typescript
// React Profiler
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
};

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Review relevant documentation sections
3. Search existing GitHub issues
4. Try reproducing the issue in a clean environment

### When Reporting Issues
Include the following information:
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Error Messages**: Full error messages and stack traces
- **Screenshots**: If applicable
- **Code Samples**: Minimal code that reproduces the issue

### Useful Commands for Debugging
```bash
# Check versions
node --version
npm --version

# Clear all caches
npm run clean
rm -rf node_modules package-lock.json
npm install

# Run with verbose logging
npm run dev --verbose

# Check bundle analysis
npm run build
npm run analyze

# Run tests with coverage
npm run test -- --coverage
```

## Emergency Procedures

### If Authentication Completely Breaks
1. Check Auth0 service status
2. Verify environment variables
3. Test with a fresh Auth0 application
4. Rollback to last working commit if necessary

### If API Integration Fails
1. Verify backend service status
2. Check network connectivity
3. Test API endpoints directly
4. Review proxy configuration

### If Build Process Fails
1. Clear all caches and dependencies
2. Check for breaking changes in dependencies
3. Verify TypeScript configuration
4. Test with a clean repository clone

---

**Remember**: When in doubt, check the documentation first, then ask for help with specific details about your issue.