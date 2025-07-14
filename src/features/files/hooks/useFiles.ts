import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { File, FileListParams } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

// Private implementation functions
const fetchProjectFiles = (projectId?: string, params: FileListParams = {}) => {
  const { isReady } = useAuth();
  
  return useQuery({
    queryKey: ['project-files', projectId, params],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId!}/files`, { params });
      return response.data;
    },
    enabled: !!projectId && isReady, // Wait for auth and require projectId
  });
};

/**
 * Hook for fetching files by project ID
 */
export const useProjectFiles = (projectId?: string, params: FileListParams = {}) => {
  return fetchProjectFiles(projectId, params);
};

/**
 * Combined hook for managing project files (read-only as per v3 API)
 */
const useFiles = (projectId: string, params: FileListParams = {}) => {
  const filesQuery = fetchProjectFiles(projectId, params);

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    refetch: filesQuery.refetch,
  };
};

export default useFiles;