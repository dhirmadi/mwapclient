import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, CreateProjectDto, UpdateProjectDto, PaginatedResponse } from '@/types';
import api from '@/utils/api';

/**
 * Hook for fetching all projects
 */
export const useProjects = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['projects', page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Project>>('/projects', { page, pageSize });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch projects');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching projects by tenant ID
 */
export const useTenantProjects = (tenantId: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['tenant-projects', tenantId, page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Project>>('/projects', { 
        tenantId, 
        page, 
        pageSize 
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch tenant projects');
      }
      return response.data;
    },
    enabled: !!tenantId,
  });
};

/**
 * Hook for fetching a single project by ID
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch project');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const response = await api.post<Project>('/projects', data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create project');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-projects', data.tenant.id] });
    },
  });
};

/**
 * Hook for updating a project
 */
export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProjectDto) => {
      const response = await api.patch<Project>(`/projects/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update project');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-projects', data.tenant.id] });
    },
  });
};

/**
 * Hook for archiving a project
 */
export const useArchiveProject = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch<Project>(`/projects/${id}`, { archived: true });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to archive project');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-projects', data.tenant.id] });
    },
  });
};

/**
 * Hook for deleting a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/projects/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete project');
      }
      return id;
    },
    onSuccess: (id, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // We don't know the tenant ID here, so we need to invalidate all tenant-projects queries
      queryClient.invalidateQueries({ queryKey: ['tenant-projects'] });
    },
  });
};