import { vi } from 'vitest';
import React from 'react';

export const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  email_verified: true,
};

export const mockAuth0 = {
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  error: undefined,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
  getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  getAccessTokenWithPopup: vi.fn(),
  getIdTokenClaims: vi.fn(),
  loginWithPopup: vi.fn(),
  handleRedirectCallback: vi.fn(),
};

export const createMockAuth0 = (overrides = {}) => ({
  ...mockAuth0,
  ...overrides,
});

// Mock the Auth0Provider
export const MockAuth0Provider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

