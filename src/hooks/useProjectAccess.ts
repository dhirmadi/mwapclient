import { Project, ProjectMemberRole } from '@/types';
import useAuth from './useAuth';

/**
 * Hook to check if the current user has access to a project
 * and determine their role within the project
 */
export const useProjectAccess = () => {
  const { user } = useAuth();

  /**
   * Check if the current user is a member of the project
   */
  const isMember = (project: Project): boolean => {
    if (!user || !project.members) return false;
    
    return project.members.some(member => member.userId === user.id);
  };

  /**
   * Check if the current user has a specific role in the project
   */
  const hasRole = (project: Project, role: ProjectMemberRole | ProjectMemberRole[]): boolean => {
    if (!user || !project.members) return false;
    
    const userMember = project.members.find(member => member.userId === user.id);
    if (!userMember) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userMember.role);
    }
    
    return userMember.role === role;
  };

  /**
   * Get the current user's role in the project
   */
  const getUserRole = (project: Project): ProjectMemberRole | null => {
    if (!user || !project.members) return null;
    
    const userMember = project.members.find(member => member.userId === user.id);
    return userMember ? userMember.role : null;
  };

  /**
   * Check if the current user is an admin of the project
   */
  const isAdmin = (project: Project): boolean => {
    return hasRole(project, ProjectMemberRole.ADMIN);
  };

  return {
    isMember,
    hasRole,
    getUserRole,
    isAdmin,
  };
};

export default useProjectAccess;