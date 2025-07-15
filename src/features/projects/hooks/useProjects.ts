import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse, handleDeleteResponse } from '../../../shared/utils/dataTransform';
import { Project, ProjectCreate, ProjectUpdate, ProjectMember } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { isReady } = useAuth();

  // Fetch all projects - wait for auth to be ready
  const { 
    data: projects, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get("/projects");
      return handleApiResponse(response, true);
    },
    enabled: isReady, // Wait for authentication to be complete
  });

  // Fetch a single project by ID
  const useProject = (id?: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: async () => {
        const response = await api.get(`/projects/${id!}`);
        return handleApiResponse(response, false);
      },
      enabled: !!id && isReady, // Wait for auth and require ID
    });
  };

  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: ProjectCreate) => {
      const response = await api.post('/projects', newProject);
      return handleApiResponse(response, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update an existing project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const response = await api.patch(`/projects/${id}`, data);
      return handleApiResponse(response, false);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });

  // Delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/projects/${id}`);
      return handleDeleteResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Project members
  const useProjectMembers = (projectId?: string) => {
    return useQuery({
      queryKey: ['project-members', projectId],
      queryFn: async () => {
        const response = await api.get(`/projects/${projectId!}/members`);
        return handleApiResponse(response, true);
      },
      enabled: !!projectId && isReady, // Wait for auth and require projectId
    });
  };

  // Add project member
  const addProjectMemberMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: ProjectMember }) => {
      const response = await api.post(`/projects/${projectId}/members`, data);
      return handleApiResponse(response, false);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Update project member
  const updateProjectMemberMutation = useMutation({
    mutationFn: async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => {
      const response = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
      return handleApiResponse(response, false);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Remove project member
  const removeProjectMemberMutation = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`);
      return handleDeleteResponse(response);
    },
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