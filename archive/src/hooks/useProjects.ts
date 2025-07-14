import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project';
import { ProjectMember } from '../types/project';
import useAuth from './useAuth';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all projects
  const { 
    data: projects, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.fetchProjects(),
  });

  // Fetch a single project by ID
  const useProject = (id?: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: () => api.fetchProjectById(id!),
      enabled: !!id,
    });
  };

  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: (newProject: ProjectCreate) => api.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update an existing project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) => 
      api.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });

  // Delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Project members
  const useProjectMembers = (projectId?: string) => {
    return useQuery({
      queryKey: ['project-members', projectId],
      queryFn: () => api.fetchProjectMembers(projectId!),
      enabled: !!projectId,
    });
  };

  // Add project member
  const addProjectMemberMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectMember }) => 
      api.addProjectMember(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Update project member
  const updateProjectMemberMutation = useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => 
      api.updateProjectMember(projectId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Remove project member
  const removeProjectMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) => 
      api.removeProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  return {
    // Projects
    projects,
    isLoading,
    error,
    refetch,
    useProject,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    createError: createProjectMutation.error,
    updateError: updateProjectMutation.error,
    deleteError: deleteProjectMutation.error,
    
    // Project members
    useProjectMembers,
    addProjectMember: addProjectMemberMutation.mutate,
    updateProjectMember: updateProjectMemberMutation.mutate,
    removeProjectMember: removeProjectMemberMutation.mutate,
    isAddingMember: addProjectMemberMutation.isPending,
    isUpdatingMember: updateProjectMemberMutation.isPending,
    isRemovingMember: removeProjectMemberMutation.isPending,
  };
};

export default useProjects;