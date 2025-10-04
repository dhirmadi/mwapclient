import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const UnauthorizedPage = () => <div>Unauthorized</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = '/', requiredRoles?: string[]) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route element={<ProtectedRoute requiredRoles={requiredRoles} />}>
            <Route path="/" element={<TestComponent />} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Authentication', () => {
    it('should show loading state while authenticating', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isReady: false,
        user: undefined,
        roles: null,
        isSuperAdmin: false,
        isTenantOwner: false,
        currentTenant: null,
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter();

      // Should not show protected content while loading
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render protected content when authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'user-123' } as any,
        roles: {} as any,
        isSuperAdmin: false,
        isTenantOwner: false,
        currentTenant: null,
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('should allow SuperAdmin access when required', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'admin-123' } as any,
        roles: {} as any,
        isSuperAdmin: true,
        isTenantOwner: false,
        currentTenant: null,
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter('/', ['SUPERADMIN']);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when SuperAdmin required but not SuperAdmin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'user-123' } as any,
        roles: {} as any,
        isSuperAdmin: false,
        isTenantOwner: false,
        currentTenant: null,
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter('/', ['SUPERADMIN']);

      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });

    it('should allow TenantOwner access when required', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'owner-123' } as any,
        roles: {} as any,
        isSuperAdmin: false,
        isTenantOwner: true,
        currentTenant: 'tenant-123',
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter('/', ['TENANT_OWNER']);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access when TenantOwner required but not TenantOwner', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'user-123' } as any,
        roles: {} as any,
        isSuperAdmin: false,
        isTenantOwner: false,
        currentTenant: null,
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter('/', ['TENANT_OWNER']);

      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
  });

  describe('Multiple Roles', () => {
    it('should allow access if user has any of the required roles', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isReady: true,
        user: { sub: 'owner-123' } as any,
        roles: {} as any,
        isSuperAdmin: false,
        isTenantOwner: true,
        currentTenant: 'tenant-123',
        hasProjectRole: vi.fn().mockReturnValue(false),
        login: vi.fn(),
        logout: vi.fn(),
        getToken: vi.fn(),
      });

      renderWithRouter('/', ['SUPERADMIN', 'TENANT_OWNER']);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});

