import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { File, FileUploadResponse, PaginatedResponse } from '@/types';
import api from '@/utils/api';

/**
 * Hook for fetching files by project ID
 */
export const useProjectFiles = (projectId: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['project-files', projectId, page, pageSize],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<File>>('/files', { 
        projectId, 
        page, 
        pageSize 
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch project files');
      }
      return response.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook for fetching a single file by ID
 */
export const useFile = (id: string) => {
  return useQuery({
    queryKey: ['file', id],
    queryFn: async () => {
      const response = await api.get<File>(`/files/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch file');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for uploading a file
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to upload file');
      }
      
      return data.data as FileUploadResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
    },
  });
};

/**
 * Hook for deleting a file
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const response = await api.delete<void>(`/files/${id}`);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete file');
      }
      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', data.projectId] });
    },
  });
};