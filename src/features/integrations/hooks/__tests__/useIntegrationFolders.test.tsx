import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/test-utils';
import { useIntegrationFolders } from '../../hooks/useIntegrationFolders';
import * as apiModule from '@/shared/utils/api';

// Mock auth to enable queries and provide tenant
vi.mock('@/core/context/AuthContext', () => ({
  useAuth: () => ({ currentTenant: 'tenant-1', isReady: true }),
}));

describe('useIntegrationFolders', () => {
  it('returns empty list when endpoint not available', async () => {
    const api = (apiModule as any).default || (apiModule as any).api;
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('404'));

    const client = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useIntegrationFolders('integration-1', '/'), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual([]);
  });

  it('returns folder items when available', async () => {
    const api = (apiModule as any).default || (apiModule as any).api;
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { success: true, data: [{ name: 'Projects', path: '/Projects' }] } });

    const client = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useIntegrationFolders('integration-1', '/'), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.[0].path).toBe('/Projects');
  });
});


