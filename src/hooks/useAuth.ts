import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { UserRole } from '@/types';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Helper function to check if user has a specific role or any of the roles in an array
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!context.user) return false;

    if (Array.isArray(role)) {
      return role.some(r => context.user?.roles.includes(r));
    }

    return context.user.roles.includes(role);
  };

  return {
    ...context,
    hasRole,
  };
};

export default useAuth;