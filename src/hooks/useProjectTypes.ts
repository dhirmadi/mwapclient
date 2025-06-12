import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectType, CreateProjectTypeDto, UpdateProjectTypeDto, PaginatedResponse } from '@/types';
import api from '@/utils/api';

/**
 * Hook for fetching all project types
 */
export const useProjectTypes = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['project-types', page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<ProjectType>>('/project-types', { page, pageSize });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch project types');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching active project types
 */
export const useActiveProjectTypes = () => {
  return useQuery({
    queryKey: ['active-project-types'],
    queryFn: async () => {
      const response = await api.get<ProjectType[]>('/project-types/active');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch active project types');
      }
      return response.data;
    },
  });
};

/**
 * Hook for fetching a single project type by ID
 */
export const useProjectType = (id: string) => {
  return useQuery({
    queryKey: ['project-type', id],
    queryFn: async () => {
      const response = await api.get<ProjectType>(`/project-types/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch project type');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new project type
 */
export const useCreateProjectType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectTypeDto) => {
      const response = await api.post<ProjectType>('/project-types', data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create project type');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      queryClient.invalidateQueries({ queryKey: ['active-project-types'] });
    },
  });
};

/**
 * Hook for updating a project type
 */
export const useUpdateProjectType = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProjectTypeDto) => {
      const response = await api.patch<ProjectType>(`/project-types/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update project type');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      queryClient.invalidateQueries({ queryKey: ['project-type', id] });
      queryClient.invalidateQueries({ queryKey: ['active-project-types'] });
    },
  });
};

/**
 * Hook for deleting a project type
 */
export const useDeleteProjectType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/project-types/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete project type');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      queryClient.invalidateQueries({ queryKey: ['active-project-types'] });
    },
  });
};