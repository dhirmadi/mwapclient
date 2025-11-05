import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponseSafe } from '../../../shared/utils/apiResponse';
import { useAuth } from '../../../core/context/AuthContext';

export interface IntegrationFolderItem {
  name: string;
  path: string;
  id?: string;
}

/**
 * Attempts to browse folders for a given integration. If the backend endpoint
 * is unavailable, the hook returns an empty list without throwing.
 *
 * Expected (optional) backend endpoint shape:
 *   GET /api/v1/tenants/:tenantId/integrations/:integrationId/folders?path=/
 *   → { success: true, data: IntegrationFolderItem[] }
 */
export const useIntegrationFolders = (
  integrationId?: string,
  path: string = '/'
) => {
  const { currentTenant, isReady } = useAuth();

  return useQuery({
    queryKey: ['integration-folders', currentTenant, integrationId, path],
    queryFn: async (): Promise<IntegrationFolderItem[]> => {
      if (!currentTenant || !integrationId) return [];
      try {
        const response = await api.get(
          `/tenants/${currentTenant}/integrations/${integrationId}/folders`,
          { params: { path } }
        );
        const result = handleApiResponseSafe<IntegrationFolderItem[]>(response, true);
        if (result.success && result.data) return result.data;
        return [];
      } catch (err) {
        // Gracefully degrade if endpoint is not implemented
        if (import.meta.env.DEV) {
          console.warn('[useIntegrationFolders] Folders endpoint unavailable:', err);
        }
        return [];
      }
    },
    enabled: isReady && !!currentTenant && !!integrationId,
    staleTime: 60_000,
  });
};

export default useIntegrationFolders;


