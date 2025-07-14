import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { Project, ProjectCreate, ProjectUpdate, ProjectMember } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

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
    queryFn: () => api.get("/projects").then(r => r.data),
  });

  // Fetch a single project by ID
  const useProject = (id?: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: async () => {
        const response = await api.get(`/projects/${id!}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: ProjectCreate) => {
      const response = await api.post('/projects', newProject);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update an existing project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
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
      return response.data;
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
        return response.data;
      },
      enabled: !!projectId,
    });
  };

  // Add project member
  const addProjectMemberMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: ProjectMember }) => {
      const response = await api.post(`/projects/${projectId}/members`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Update project member
  const updateProjectMemberMutation = useMutation({
    mutationFn: async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => {
      const response = await api.put(`/projects/${projectId}/members/${userId}`, { role });
      return response.data;
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
      return response.data;
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