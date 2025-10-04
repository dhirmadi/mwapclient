# Authentication Troubleshooting Guide

This guide helps developers troubleshoot common authentication issues in the MWAP Client application.

## Common Issues and Solutions

### 1. Role-Based UI Elements Not Displaying

**Symptoms:**
- SuperAdmin quick actions don't appear on Home page
- TenantOwner features are missing despite correct API responses
- Role-based navigation items are not visible
- Console shows correct roles in API responses but UI doesn't reflect them

**Root Cause:**
Authentication race condition - components render before authentication state is fully ready.

**Solution:**
Always use `isReady` state coordination:

```tsx
// ❌ WRONG - Don't do this
const MyComponent = () => {
  const { isSuperAdmin } = useAuth();
  
  return (
    <div>
      {isSuperAdmin && <AdminPanel />}
    </div>
  );
};

// ✅ CORRECT - Always check isReady first
const MyComponent = () => {
  const { isReady, isSuperAdmin } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner message="Loading user permissions..." />;
  }
  
  return (
    <div>
      {isReady && isSuperAdmin && <AdminPanel />}
    </div>
  );
};
```

**Debugging Steps:**
1. Add debug logging to track authentication state:
```tsx
useEffect(() => {
  console.log('Auth Debug:', { isReady, isSuperAdmin, isTenantOwner });
}, [isReady, isSuperAdmin, isTenantOwner]);
```

2. Check browser console for authentication state progression
3. Verify API responses in Network tab
4. Ensure AuthContext is properly providing `isReady` state

### 2. API Calls Failing with 401 Unauthorized

**Symptoms:**
- API requests return 401 status
- User gets logged out unexpectedly
- "Unauthorized" errors in console

**Root Cause:**
- Expired access tokens
- Missing or invalid Authorization header
- Token not being refreshed properly

**Solution:**
1. Check token refresh configuration in Auth0Provider:
```tsx
<Auth0Provider
  useRefreshTokens={true}
  cacheLocation="memory"
  // ... other config
>
```

2. Verify API client includes token in headers:
```tsx
const token = await getAccessTokenSilently();
const response = await axios.get('/api/endpoint', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

3. Handle token refresh errors gracefully:
```tsx
try {
  const token = await getAccessTokenSilently();
  // Make API call
} catch (error) {
  if (error.error === 'login_required') {
    // Redirect to login
    loginWithRedirect();
  }
}
```

### 3. Infinite Loading States

**Symptoms:**
- Components show loading spinner indefinitely
- `isLoading` never becomes false
- Application appears stuck

**Root Cause:**
- AuthContext not properly setting `isReady` state
- Circular dependencies in useEffect hooks
- API calls that never resolve

**Solution:**
1. Ensure AuthContext properly handles all authentication states:
```tsx
useEffect(() => {
  const initializeAuth = async () => {
    try {
      if (isAuthenticated && user) {
        await loadUserRoles();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      // Always set ready, even on error
      setIsReady(true);
    }
  };

  if (!isLoading) {
    initializeAuth();
  }
}, [isAuthenticated, user, isLoading]);
```

2. Add timeout fallbacks for API calls:
```tsx
const loadUserRoles = async () => {
  const timeoutId = setTimeout(() => {
    console.warn('User roles loading timeout');
    setIsReady(true);
  }, 10000); // 10 second timeout

  try {
    const roles = await fetchUserRoles();
    setRoles(roles);
  } finally {
    clearTimeout(timeoutId);
    setIsReady(true);
  }
};
```

### 4. Role Permissions Not Updating

**Symptoms:**
- User role changes don't reflect in UI
- Permissions seem cached or stale
- Need to refresh page to see role updates

**Root Cause:**
- Role data not being refetched after updates
- Stale cache in React Query or local state
- Missing dependency arrays in useEffect

**Solution:**
1. Implement role refetch mechanism:
```tsx
const { refetchRoles } = useAuth();

// After role update
await updateUserRole(userId, newRole);
await refetchRoles();
```

2. Use React Query for automatic cache invalidation:
```tsx
const { data: roles, refetch } = useQuery({
  queryKey: ['user-roles'],
  queryFn: fetchUserRoles,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

3. Clear relevant caches after role changes:
```tsx
queryClient.invalidateQueries(['user-roles']);
queryClient.invalidateQueries(['projects']);
```

## Debugging Tools

### 1. Authentication State Logger

Add this to your AuthContext for debugging:

```tsx
// Development-only logging
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔐 Auth State Update');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isLoading:', isLoading);
    console.log('isReady:', isReady);
    console.log('user:', user);
    console.log('roles:', roles);
    console.log('isSuperAdmin:', isSuperAdmin);
    console.log('isTenantOwner:', isTenantOwner);
    console.groupEnd();
  }
}, [isAuthenticated, isLoading, isReady, user, roles, isSuperAdmin, isTenantOwner]);
```

### 2. API Request Logger

Add request/response interceptors to track API calls:

```tsx
// Add to API client
axios.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);
```

### 3. Component Render Tracker

Track when components render and their authentication state:

```tsx
const useRenderLogger = (componentName: string) => {
  const { isReady, isSuperAdmin, isTenantOwner } = useAuth();
  
  useEffect(() => {
    console.log(`🔄 ${componentName} rendered:`, {
      isReady,
      isSuperAdmin,
      isTenantOwner,
      timestamp: new Date().toISOString()
    });
  });
};

// Usage in components
const MyComponent = () => {
  useRenderLogger('MyComponent');
  // ... rest of component
};
```

## Best Practices

### 1. Always Use isReady Coordination

```tsx
// Template for role-based components
const RoleBasedComponent = () => {
  const { isReady, isSuperAdmin, isTenantOwner } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner message="Loading permissions..." />;
  }
  
  return (
    <div>
      {isReady && isSuperAdmin && <SuperAdminContent />}
      {isReady && isTenantOwner && <TenantOwnerContent />}
    </div>
  );
};
```

### 2. Handle Authentication Errors Gracefully

```tsx
const useAuthenticatedApi = () => {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();
  
  const makeAuthenticatedRequest = async (apiCall: () => Promise<any>) => {
    try {
      const token = await getAccessTokenSilently();
      return await apiCall();
    } catch (error) {
      if (error.error === 'login_required') {
        loginWithRedirect();
        return;
      }
      throw error;
    }
  };
  
  return { makeAuthenticatedRequest };
};
```

### 3. Provide Meaningful Loading States

```tsx
const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <Card>
    <Group>
      <Loader size="sm" />
      <Text size="sm" c="dimmed">{message}</Text>
    </Group>
  </Card>
);

// Usage
if (!isReady) {
  return <LoadingState message="Loading user permissions..." />;
}
```

## Testing Authentication

### 1. Test Authentication States

```tsx
// Test helper for mocking auth states
export const mockAuthState = (overrides = {}) => ({
  isAuthenticated: true,
  isLoading: false,
  isReady: true,
  user: { sub: 'test-user' },
  isSuperAdmin: false,
  isTenantOwner: false,
  ...overrides
});

// In tests
const { render } = renderWithAuth(<MyComponent />, {
  authState: mockAuthState({ isSuperAdmin: true })
});
```

### 2. Test Race Conditions

```tsx
// Test that components handle authentication not ready
test('shows loading state when auth not ready', () => {
  const { getByText } = renderWithAuth(<MyComponent />, {
    authState: mockAuthState({ isReady: false })
  });
  
  expect(getByText('Loading permissions...')).toBeInTheDocument();
});
```

## Conclusion

Authentication issues are often related to timing and state coordination. The key principles are:

1. **Always check `isReady` before role-based rendering**
2. **Provide meaningful loading states**
3. **Handle errors gracefully**
4. **Use debugging tools to track state changes**
5. **Test authentication states thoroughly**

Following these patterns will prevent most authentication-related issues and provide a better user experience.