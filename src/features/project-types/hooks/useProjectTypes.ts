import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { ProjectType, ProjectTypeCreate, ProjectTypeUpdate } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

export const useProjectTypes = () => {
  const queryClient = useQueryClient();
  const { isReady } = useAuth();

  // Fetch all project types - wait for auth to be ready
  const { 
    data: projectTypes, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['project-types'],
    queryFn: async () => {
      try {
        const response = await api.get("/project-types");
        console.log('useProjectTypes - fetchProjectTypes response:', response.data);
        
        // Handle both response formats: { success: true, data: [...] } or directly the array
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          console.log('Using wrapped response format, returning:', response.data.data);
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('Using direct array format, returning:', response.data);
          return response.data;
        }
        
        console.log('No valid data found, returning empty array');
        return [];
      } catch (error) {
        console.error('Error fetching project types:', error);
        throw error;
      }
    },
    enabled: isReady, // Wait for authentication to be complete
    retry: 1,
  });

  // Fetch a single project type by ID
  const useProjectType = (id?: string) => {
    return useQuery({
      queryKey: ['project-type', id],
      queryFn: async () => {
        try {
          const response = await api.get(`/project-types/${id!}`);
          console.log(`useProjectType - fetchProjectType ${id} response:`, response.data);
          
          // Handle both response formats: { success: true, data: {...} } or directly the object
          if (response.data && response.data.success && response.data.data) {
            console.log('Using wrapped response format, returning:', response.data.data);
            return response.data.data;
          } else if (response.data && !response.data.success) {
            console.log('Using direct object format, returning:', response.data);
            return response.data;
          }
          
          console.log('No valid data found for project type');
          throw new Error('Project type not found');
        } catch (error) {
          console.error(`Error fetching project type ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id && isReady, // Wait for auth and require ID
      retry: 1,
    });
  };

  // Create a new project type (SuperAdmin only)
  const createProjectTypeMutation = useMutation({
    mutationFn: async (data: ProjectTypeCreate) => {
      try {
        // Ensure the data structure matches the expected API payload
        const payload = {
          name: data.name,
          description: data.description || "Project type configuration",
          isActive: data.isActive !== undefined ? data.isActive : true,
          configSchema: data.configSchema || {
            inputFolder: "string",
            outputFolder: "string"
          }
        };
        const response = await api.post("/project-types", payload);
        console.log('createProjectType response:', response.data);
        
        // Handle both response formats: { success: true, data: {...} } or directly the object
        if (response.data && response.data.success && response.data.data) {
          return response.data.data;
        } else if (response.data && !response.data.success) {
          return response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error('Error creating project type:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });

  // Update a project type (SuperAdmin only)
  const updateProjectTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectTypeUpdate }) => {
      try {
        // Ensure the data structure matches the expected API payload
        const payload: ProjectTypeUpdate = {};
        
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.isActive !== undefined) payload.isActive = data.isActive;
        if (data.configSchema !== undefined) payload.configSchema = data.configSchema;
        
        const response = await api.patch(`/project-types/${id}`, payload);
        console.log(`updateProjectType ${id} response:`, response.data);
        
        // Handle both response formats: { success: true, data: {...} } or directly the object
        if (response.data && response.data.success && response.data.data) {
          return response.data.data;
        } else if (response.data && !response.data.success) {
          return response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error(`Error updating project type ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      queryClient.invalidateQueries({ queryKey: ['project-type', variables.id] });
    },
  });

  // Delete a project type (SuperAdmin only)
  const deleteProjectTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.delete(`/project-types/${id}`);
        console.log(`deleteProjectType ${id} response:`, response.data);
        
        // Handle both response formats: { success: true, data: {...} } or directly the object
        if (response.data && response.data.success && response.data.data) {
          return response.data.data;
        } else if (response.data && !response.data.success) {
          return response.data;
        }
        
        return response.data;
      } catch (error) {
        console.error(`Error deleting project type ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });

  return {
    projectTypes,
    isLoading,
    error,
    refetch,
    useProjectType,
    createProjectType: createProjectTypeMutation.mutate,
    updateProjectType: updateProjectTypeMutation.mutate,
    deleteProjectType: deleteProjectTypeMutation.mutate,
    isCreating: createProjectTypeMutation.isPending,
    isUpdating: updateProjectTypeMutation.isPending,
    isDeleting: deleteProjectTypeMutation.isPending,
    createError: createProjectTypeMutation.error,
    updateError: updateProjectTypeMutation.error,
    deleteError: deleteProjectTypeMutation.error,
  };
};

export default useProjectTypes;