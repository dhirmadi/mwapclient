import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthProvider, { useAuth } from '../AuthContext';
import { mockUser, mockAuth0 } from '../../../test/mocks/auth0.mock';
import {
  mockRolesResponse,
  mockSuperAdminRolesResponse,
  createMockApiResponse,
} from '../../../test/mocks/api.mock';
import * as api from '../../../shared/utils/api';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
  useAuth0: vi.fn(),
}));

// Mock API client
vi.mock('../../../shared/utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AuthContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    // Clear localStorage
    localStorage.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  describe('Authentication State', () => {
    it('should provide unauthenticated state initially', () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: false,
        isLoading: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeUndefined();
      expect(result.current.roles).toBeNull();
    });

    it('should provide authenticated state with user', () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle loading state', () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isLoading: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Role Fetching and Caching', () => {
    it('should fetch roles for authenticated user', async () => {
      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      expect(result.current.isTenantOwner).toBe(true);
      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.currentTenant).toBe('tenant-123');
    });

    it('should cache roles in localStorage', async () => {
      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // Check localStorage
      const cached = localStorage.getItem('mwap_user_roles_cache');
      expect(cached).toBeTruthy();

      if (cached) {
        const parsed = JSON.parse(cached);
        expect(parsed.userId).toBe(mockUser.sub);
        expect(parsed.data).toEqual(mockRolesResponse);
        expect(parsed.timestamp).toBeTruthy();
      }
    });

    it('should use cached roles from localStorage', async () => {
      // Pre-populate localStorage with cached roles
      const cache = {
        data: mockRolesResponse,
        timestamp: Date.now(),
        userId: mockUser.sub,
      };
      localStorage.setItem('mwap_user_roles_cache', JSON.stringify(cache));

      const mockGet = vi.fn();
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // Should not fetch from API (uses cache)
      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.isTenantOwner).toBe(true);
    });

    it('should invalidate expired cache', async () => {
      // Pre-populate localStorage with expired cache (older than 15 minutes)
      const expiredCache = {
        data: mockRolesResponse,
        timestamp: Date.now() - (16 * 60 * 1000), // 16 minutes ago
        userId: mockUser.sub,
      };
      localStorage.setItem('mwap_user_roles_cache', JSON.stringify(expiredCache));

      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // Should fetch from API (cache expired)
      expect(mockGet).toHaveBeenCalled();
    });

    it('should handle different users correctly', async () => {
      // Pre-populate localStorage with cache for different user
      const differentUserCache = {
        data: mockRolesResponse,
        timestamp: Date.now(),
        userId: 'auth0|different-user',
      };
      localStorage.setItem('mwap_user_roles_cache', JSON.stringify(differentUserCache));

      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockSuperAdminRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      const differentUser = { ...mockUser, sub: 'auth0|current-user' };

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: differentUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // Should fetch from API (different user)
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);
    });

    it('should correctly identify SuperAdmin', async () => {
      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockSuperAdminRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuperAdmin).toBe(true);
      });

      expect(result.current.isTenantOwner).toBe(false);
    });

    it('should correctly identify TenantOwner', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isTenantOwner).toBe(true);
      });

      expect(result.current.isSuperAdmin).toBe(false);
    });

    it('should check project role correctly (OWNER)', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // User is OWNER of project-1
      expect(result.current.hasProjectRole('project-1', 'OWNER')).toBe(true);
      expect(result.current.hasProjectRole('project-1', 'DEPUTY')).toBe(true);
      expect(result.current.hasProjectRole('project-1', 'MEMBER')).toBe(true);
    });

    it('should check project role correctly (MEMBER)', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      // User is MEMBER of project-2
      expect(result.current.hasProjectRole('project-2', 'MEMBER')).toBe(true);
      expect(result.current.hasProjectRole('project-2', 'DEPUTY')).toBe(false);
      expect(result.current.hasProjectRole('project-2', 'OWNER')).toBe(false);
    });

    it('should return false for non-existent project', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toBeTruthy();
      });

      expect(result.current.hasProjectRole('non-existent', 'MEMBER')).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear cache on logout', async () => {
      // Set up authenticated state with cached roles
      const cache = {
        data: mockRolesResponse,
        timestamp: Date.now(),
        userId: mockUser.sub,
      };
      localStorage.setItem('mwap_user_roles_cache', JSON.stringify(cache));

      const mockLogout = vi.fn();
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Call logout
      act(() => {
        result.current.logout();
      });

      // Should clear localStorage
      expect(localStorage.getItem('mwap_user_roles_cache')).toBeNull();
      
      // Should call Auth0 logout
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('isReady State', () => {
    it('should not be ready while loading', () => {
      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: true,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isReady).toBe(false);
    });

    it('should be ready when authenticated and roles loaded', async () => {
      const mockGet = vi.fn().mockResolvedValue(
        createMockApiResponse(mockRolesResponse)
      );
      vi.mocked(api.default.get).mockImplementation(mockGet);

      vi.mocked(useAuth0).mockReturnValue({
        ...mockAuth0,
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.roles).toBeTruthy();
    });
  });
});

