import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { File, FileListParams } from '../types/file';
import axios from 'axios';

/**
 * Hook for fetching files by project ID
 */
export const useProjectFiles = (projectId?: string, params: FileListParams = {}) => {
  return useQuery({
    queryKey: ['project-files', projectId, params],
    queryFn: () => api.fetchProjectFiles(projectId!, params),
    enabled: !!projectId,
  });
};

/**
 * Hook for uploading a file
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      file, 
      folder = '/' 
    }: { 
      projectId: string; 
      file: File; 
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

/**
 * Hook for deleting a file
 */
export const useDeleteFile = () => {
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

export default useProjectFiles;