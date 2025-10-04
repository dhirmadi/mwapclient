import { vi } from 'vitest';
import type { UserRolesResponse } from '../../features/auth/types/auth.types';

export const mockRolesResponse: UserRolesResponse = {
  userId: 'auth0|123456789',
  isSuperAdmin: false,
  isTenantOwner: true,
  tenantId: 'tenant-123',
  projectRoles: [
    {
      projectId: 'project-1',
      role: 'OWNER',
    },
    {
      projectId: 'project-2',
      role: 'MEMBER',
    },
  ],
};

export const mockSuperAdminRolesResponse: UserRolesResponse = {
  userId: 'auth0|superadmin',
  isSuperAdmin: true,
  isTenantOwner: false,
  tenantId: null,
  projectRoles: [],
};

export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

export const createMockApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

export const createMockErrorResponse = (message: string, status = 400) => ({
  response: {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {} as any,
  },
  message,
  name: 'AxiosError',
  config: {} as any,
  isAxiosError: true,
  toJSON: () => ({}),
});

