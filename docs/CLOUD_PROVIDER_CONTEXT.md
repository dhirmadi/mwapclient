# Cloud Provider Context

## Overview

The MWAP application uses a centralized CloudProviderContext to manage cloud provider state and operations. This document explains how the CloudProviderContext works and how to use it in your components.

## CloudProviderContext

The CloudProviderContext is defined in `src/context/CloudProviderContext.tsx` and provides a centralized way to access and manage cloud providers.

## Key Features

1. **Centralized State Management**: All cloud provider data is managed in one place
2. **Standardized Error Handling**: Consistent error handling for cloud provider operations
3. **Caching**: Efficient caching of cloud provider data
4. **Loading States**: Standardized loading states for cloud provider operations
5. **Type Safety**: Full TypeScript support for cloud provider data

## Using CloudProviderContext

### 1. Accessing Cloud Providers

```tsx
import { useCloudProviderContext } from '../context/CloudProviderContext';

const MyComponent = () => {
  const { 
    cloudProviders, 
    isLoading, 
    error 
  } = useCloudProviderContext();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  
  return (
    <div>
      <h1>Cloud Providers</h1>
      <ul>
        {cloudProviders.map(provider => (
          <li key={provider.id}>{provider.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 2. Managing Cloud Providers

```tsx
import { useCloudProviderContext } from '../context/CloudProviderContext';

const CloudProviderForm = () => {
  const { 
    createCloudProvider, 
    isCreating, 
    createError 
  } = useCloudProviderContext();
  
  const handleSubmit = async (data) => {
    try {
      await createCloudProvider(data);
      // Success handling
    } catch (error) {
      // Error already handled by context
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Cloud Provider'}
      </button>
      {createError && <ErrorMessage message={createError.message} />}
    </form>
  );
};
```

### 3. Getting a Single Cloud Provider

```tsx
import { useCloudProviderContext } from '../context/CloudProviderContext';

const CloudProviderDetails = ({ id }) => {
  const { getCloudProvider } = useCloudProviderContext();
  const { 
    data: provider, 
    isLoading, 
    error 
  } = getCloudProvider(id);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  
  return (
    <div>
      <h1>{provider.name}</h1>
      <p>{provider.description}</p>
    </div>
  );
};
```

### 4. Using with Tenant Integrations

```tsx
import { useCloudProviderContext } from '../context/CloudProviderContext';

const TenantIntegrations = ({ tenantId }) => {
  const { 
    getCloudProviderIntegrations, 
    createCloudProviderIntegration 
  } = useCloudProviderContext();
  
  const { 
    data: integrations, 
    isLoading, 
    error 
  } = getCloudProviderIntegrations(tenantId);
  
  // Rest of the component
};
```

## Provider Setup

The CloudProviderContext provider is set up in `App.tsx`:

```tsx
import { CloudProviderProvider } from './context/CloudProviderContext';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CloudProviderProvider>
          <AppRouter />
        </CloudProviderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
```

## Context API

The CloudProviderContext provides the following:

### State
- `cloudProviders`: Array of cloud providers
- `isLoading`: Boolean indicating if cloud providers are loading
- `error`: Error object if loading failed

### Operations
- `getCloudProvider(id)`: Get a single cloud provider
- `createCloudProvider(data)`: Create a new cloud provider
- `updateCloudProvider(id, data)`: Update a cloud provider
- `deleteCloudProvider(id)`: Delete a cloud provider
- `getCloudProviderIntegrations(tenantId)`: Get cloud provider integrations for a tenant
- `createCloudProviderIntegration(tenantId, data)`: Create a new cloud provider integration
- `updateCloudProviderIntegration(tenantId, integrationId, data)`: Update a cloud provider integration
- `deleteCloudProviderIntegration(tenantId, integrationId)`: Delete a cloud provider integration

### Loading States
- `isCreating`: Boolean indicating if a cloud provider is being created
- `isUpdating`: Boolean indicating if a cloud provider is being updated
- `isDeleting`: Boolean indicating if a cloud provider is being deleted

### Error States
- `createError`: Error object if creation failed
- `updateError`: Error object if update failed
- `deleteError`: Error object if deletion failed

## Best Practices

1. **Always use the CloudProviderContext** for cloud provider operations
2. **Handle loading and error states** in your components
3. **Use the context's mutation functions** for creating, updating, and deleting
4. **Provide meaningful error messages** to users
5. **Use TypeScript** for type safety

## Migrating Existing Code

When updating existing components:

1. Replace:
   ```tsx
   import { useCloudProviders } from '../hooks/useCloudProviders';

   const MyComponent = () => {
     const { cloudProviders, isLoading, error } = useCloudProviders();
     // Rest of the component
   };
   ```

2. With:
   ```tsx
   import { useCloudProviderContext } from '../context/CloudProviderContext';

   const MyComponent = () => {
     const { cloudProviders, isLoading, error } = useCloudProviderContext();
     // Rest of the component
   };
   ```

## Troubleshooting

If you encounter issues with the CloudProviderContext:

1. Check that the CloudProviderProvider is properly set up in the component tree
2. Verify that you're using the correct context functions
3. Check the browser console for detailed error information
4. Ensure that the API is returning data in the expected format