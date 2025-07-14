import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { File, FileListParams } from '../types';
import axios from 'axios';

// Private implementation functions
const fetchProjectFiles = (projectId?: string, params: FileListParams = {}) => {
  return useQuery({
    queryKey: ['project-files', projectId, params],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId!}/files`, { params });
      return response.data;
    },
    enabled: !!projectId,
  });
};

const useUploadFileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      file, 
      folder = '/' 
    }: { 
      projectId: string; 
      file: Blob; // Changed from File to Blob to fix type error
      folder?: string 
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await axios.post(
        `${apiUrl}/projects/${projectId}/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['project-files', variables.projectId] 
      });
    },
  });
};

const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      fileId 
    }: { 
      projectId: string; 
      fileId: string 
    }) => {
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      await axios.delete(
        `${apiUrl}/projects/${projectId}/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return { projectId, fileId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['project-files', data.projectId] 
      });
    },
  });
};

/**
 * Hook for fetching files by project ID
 */
export const useProjectFiles = (projectId?: string, params: FileListParams = {}) => {
  return fetchProjectFiles(projectId, params);
};

/**
 * Combined hook for managing project files
 */
const useFiles = (projectId: string) => {
  const filesQuery = fetchProjectFiles(projectId);
  const uploadMutation = useUploadFileMutation();
  const deleteMutation = useDeleteFileMutation();

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    refetch: filesQuery.refetch,
    uploadFile: (file: Blob, folder = '/') => 
      uploadMutation.mutate({ projectId, file, folder }),
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    deleteFile: (fileId: string) => 
      deleteMutation.mutate({ projectId, fileId }),
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
};

export default useFiles;