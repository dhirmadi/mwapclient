import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/test-utils';
import useProjects from '../../hooks/useProjects';
import * as apiModule from '@/shared/utils/api';

describe('useProjects', () => {
  it('fetches project list', async () => {
    const api = (apiModule as any).default || (apiModule as any).api;
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { success: true, data: [{ _id: '1', name: 'A' }] } });
    // Also mock isReady to allow query to run
    vi.mock('@/core/context/AuthContext', () => ({ useAuth: () => ({ isReady: true }) }));

    const client = createTestQueryClient();
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useProjects(), { wrapper });
    await waitFor(() => expect(result.current.projects).toBeDefined());
    expect((result.current.projects as any[])[0].id).toBe('1');
  });
});


