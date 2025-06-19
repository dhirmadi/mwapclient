# API Call Optimization

This document outlines the optimizations made to reduce unnecessary API calls during application loading and improve overall performance.

## Key Issues Identified

1. **Excessive API Calls on Load**: The application was making too many API calls during initial loading, even for data that wasn't immediately needed.
2. **Login Button Flash**: Users would briefly see the login button before being redirected to the dashboard.
3. **Redundant Data Fetching**: Multiple components were fetching the same data, causing duplicate API calls.
4. **Eager Loading**: Data was being fetched regardless of whether the user needed it based on their role.

## Optimization Strategies Implemented

### 1. Role-Based API Call Optimization

- **CloudProviderContext.tsx**:
  - Cloud providers are now only fetched if the user is a SuperAdmin
  - Tenant integrations are only fetched if the user has a tenant and is a tenant owner

```tsx
// Before
const { data: cloudProviders = [] } = useQuery({
  queryKey: ['cloud-providers'],
  // ...
});

// After
const { data: cloudProviders = [] } = useQuery({
  queryKey: ['cloud-providers'],
  // ...
  enabled: isSuperAdmin, // Only fetch if user is a SuperAdmin
});
```

### 2. Lazy Loading Data

- **useTenants.ts**:
  - Tenants are now only fetched when explicitly requested, not on application load
  - Archived tenants are only fetched when needed
  - Current tenant uses data from roles when possible to avoid an API call

```tsx
// Before
const { data: tenants } = useQuery({
  // ...
  enabled: isSuperAdmin || canManageTenants,
});

// After
const { data: tenants } = useQuery({
  // ...
  enabled: false, // Don't fetch on mount, only when explicitly requested
});
```

### 3. Preventing Login Button Flash

- **ProtectedRoute.tsx** and **AuthRedirect.tsx**:
  - Added loading states to prevent UI flashing during authentication
  - Improved comments to explain the purpose of each condition

```tsx
// Before
if (isLoading) {
  return <LoadingSpinner />;
}

// After
if (isLoading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" text="Authenticating..." />
    </div>
  );
}
```

### 4. Caching and Reusing Data

- **useTenant.ts**:
  - Now checks if the requested tenant is the current user's tenant before making an API call
  - Disabled automatic refetching to prevent unnecessary API calls

```tsx
// Before
return useQuery({
  // ...
  enabled: !!id,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
});

// After
return useQuery({
  // ...
  enabled: false, // Don't fetch on mount, only when explicitly requested
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

## Best Practices for Future Development

1. **Conditional Fetching**: Always use the `enabled` option to conditionally fetch data based on user roles and needs.
2. **Minimize Initial Load**: Only fetch data that is absolutely necessary for the initial render.
3. **Use Role Information**: Leverage the user's role information to determine what data to fetch.
4. **Avoid Duplicate Requests**: Use React Query's caching capabilities to avoid duplicate requests.
5. **Loading States**: Always show appropriate loading states to prevent UI flashing.

## Performance Impact

These optimizations significantly reduce the number of API calls made during application loading:

- **Before**: Multiple API calls for tenants, cloud providers, and integrations regardless of user role
- **After**: Only essential API calls based on user role (roles first, then conditional calls)

This results in faster application startup, reduced server load, and improved user experience.