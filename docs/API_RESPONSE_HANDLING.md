# API Response Handling

## Overview

The MWAP application uses a standardized approach to handle API responses. This document explains how the API response handling system works and how to use it in your components.

## API Response Handler

The API response handler is defined in `src/utils/apiResponseHandler.ts` and provides utilities for extracting data from API responses and handling errors consistently.

## Key Functions

### 1. `extractData<T>`

Extracts data from an API response with proper type checking.

```typescript
import { extractData } from '../utils/apiResponseHandler';
import { Tenant } from '../types/tenant';

// In a React Query function
const fetchTenant = async (id: string) => {
  const response = await api.fetchTenantById(id);
  return extractData<Tenant>(response);
};
```

### 2. `extractArrayData<T>`

Extracts an array of data from an API response with proper type checking.

```typescript
import { extractArrayData } from '../utils/apiResponseHandler';
import { CloudProvider } from '../types/cloud-provider';

// In a React Query function
const fetchCloudProviders = async () => {
  const response = await api.fetchCloudProviders();
  return extractArrayData<CloudProvider>(response);
};
```

### 3. `createApiError`

Creates a standardized error object from an API error.

```typescript
import { createApiError } from '../utils/apiResponseHandler';

try {
  const response = await api.createTenant(data);
  return extractData<Tenant>(response);
} catch (error) {
  throw createApiError(error, 'Failed to create tenant');
}
```

## Using with React Query

The API response handler is designed to work seamlessly with React Query:

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { extractData, createApiError } from '../utils/apiResponseHandler';
import { Tenant } from '../types/tenant';

const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      try {
        const response = await api.fetchTenantById(id);
        return extractData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, `Failed to fetch tenant with ID ${id}`);
      }
    },
    enabled: !!id,
  });
};
```

## Error Handling

The API response handler provides consistent error handling:

```typescript
import { useMutation } from '@tanstack/react-query';
import { extractData, createApiError } from '../utils/apiResponseHandler';
import { notifications } from '@mantine/notifications';

const createTenantMutation = useMutation({
  mutationFn: async (data) => {
    try {
      const response = await api.createTenant(data);
      return extractData(response);
    } catch (error) {
      throw createApiError(error, 'Failed to create tenant');
    }
  },
  onError: (error) => {
    // The error will have a consistent format
    notifications.show({
      title: 'Error',
      message: error.message,
      color: 'red',
    });
  },
});
```

## Response Format

The API response handler expects responses in one of these formats:

1. Direct data:
   ```json
   { "id": "123", "name": "Example" }
   ```

2. Wrapped data:
   ```json
   { "data": { "id": "123", "name": "Example" } }
   ```

3. Array data:
   ```json
   [{ "id": "123", "name": "Example" }, { "id": "456", "name": "Another Example" }]
   ```

4. Wrapped array data:
   ```json
   { "data": [{ "id": "123", "name": "Example" }, { "id": "456", "name": "Another Example" }] }
   ```

## Best Practices

1. **Always use the API response handler** for consistent data extraction
2. **Provide meaningful error messages** when using `createApiError`
3. **Use proper TypeScript types** with the extraction functions
4. **Handle errors gracefully** in the UI
5. **Use the response handler with React Query** for optimal caching and error handling

## Migrating Existing Code

When updating existing components:

1. Replace:
   ```typescript
   const fetchData = async () => {
     try {
       const data = await api.fetchSomething();
       return data;
     } catch (error) {
       console.error('Error:', error);
       throw error;
     }
   };
   ```

2. With:
   ```typescript
   const fetchData = async () => {
     try {
       const response = await api.fetchSomething();
       return extractData(response);
     } catch (error) {
       throw createApiError(error, 'Failed to fetch data');
     }
   };
   ```

## Troubleshooting

If you encounter issues with the API response handler:

1. Check the response format from the API
2. Ensure you're using the correct extraction function for the response type
3. Verify that the TypeScript type matches the expected response data
4. Check the browser console for detailed error information