import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import api from '../../../shared/utils/api';
import { Integration, IntegrationStatus } from '../types';

interface BulkOperationResult {
  success: boolean;
  integrationId: string;
  error?: string;
}

interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string; // Current integration being processed
  results: BulkOperationResult[];
}

interface BulkRefreshTokensRequest {
  integrationIds: string[];
  forceRefresh?: boolean;
}

interface BulkUpdateStatusRequest {
  integrationIds: string[];
  status: IntegrationStatus;
}

interface BulkDeleteRequest {
  integrationIds: string[];
  confirmationToken: string; // Security measure for bulk delete
}

interface BulkTestConnectionsRequest {
  integrationIds: string[];
  timeout?: number; // milliseconds
}

interface UseBulkOperationsReturn {
  // State
  progress: BulkOperationProgress | null;
  isProcessing: boolean;
  
  // Operations
  refreshTokens: (request: BulkRefreshTokensRequest) => Promise<BulkOperationResult[]>;
  updateStatus: (request: BulkUpdateStatusRequest) => Promise<BulkOperationResult[]>;
  deleteIntegrations: (request: BulkDeleteRequest) => Promise<BulkOperationResult[]>;
  testConnections: (request: BulkTestConnectionsRequest) => Promise<BulkOperationResult[]>;
  
  // Progress management
  resetProgress: () => void;
  cancelOperation: () => void;
  
  // Utilities
  generateConfirmationToken: () => string;
  validateSelection: (integrationIds: string[], integrations: Integration[]) => {
    valid: boolean;
    errors: string[];
  };
}

export const useBulkOperations = (): UseBulkOperationsReturn => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Helper function to process operations in batches
  const processBatch = async <T extends { integrationIds: string[] }>(
    request: T,
    operation: (integrationId: string, signal: AbortSignal) => Promise<any>,
    operationName: string
  ): Promise<BulkOperationResult[]> => {
    const { integrationIds } = request;
    const results: BulkOperationResult[] = [];
    
    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);
    
    // Initialize progress
    const initialProgress: BulkOperationProgress = {
      total: integrationIds.length,
      completed: 0,
      failed: 0,
      results: [],
    };
    setProgress(initialProgress);
    setIsProcessing(true);

    try {
      // Process integrations in parallel batches of 3 to avoid overwhelming the server
      const batchSize = 3;
      for (let i = 0; i < integrationIds.length; i += batchSize) {
        if (controller.signal.aborted) {
          throw new Error('Operation cancelled');
        }

        const batch = integrationIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (integrationId) => {
          setProgress(prev => prev ? { ...prev, current: integrationId } : null);
          
          try {
            await operation(integrationId, controller.signal);
            const result: BulkOperationResult = {
              success: true,
              integrationId,
            };
            results.push(result);
            
            setProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              results: [...prev.results, result],
            } : null);
            
            return result;
          } catch (error: any) {
            const result: BulkOperationResult = {
              success: false,
              integrationId,
              error: error.message || `Failed to ${operationName}`,
            };
            results.push(result);
            
            setProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              failed: prev.failed + 1,
              results: [...prev.results, result],
            } : null);
            
            return result;
          }
        });

        await Promise.all(batchPromises);
      }

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await queryClient.invalidateQueries({ queryKey: ['integration-health'] });

      return results;
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  // Bulk refresh tokens
  const refreshTokensMutation = useMutation({
    mutationFn: async (request: BulkRefreshTokensRequest) => {
      return processBatch(
        request,
        async (integrationId, signal) => {
          const response = await api.post(
            `/integrations/${integrationId}/refresh-token`,
            { forceRefresh: request.forceRefresh },
            { signal }
          );
          return response.data;
        },
        'refresh token'
      );
    },
  });

  // Bulk update status
  const updateStatusMutation = useMutation({
    mutationFn: async (request: BulkUpdateStatusRequest) => {
      return processBatch(
        request,
        async (integrationId, signal) => {
          const response = await api.patch(
            `/integrations/${integrationId}`,
            { status: request.status },
            { signal }
          );
          return response.data;
        },
        'update status'
      );
    },
  });

  // Bulk delete integrations
  const deleteIntegrationsMutation = useMutation({
    mutationFn: async (request: BulkDeleteRequest) => {
      return processBatch(
        request,
        async (integrationId, signal) => {
          const response = await api.delete(
            `/integrations/${integrationId}`,
            {
              signal,
              headers: {
                'X-Confirmation-Token': request.confirmationToken,
              },
            }
          );
          return response.data;
        },
        'delete integration'
      );
    },
  });

  // Bulk test connections
  const testConnectionsMutation = useMutation({
    mutationFn: async (request: BulkTestConnectionsRequest) => {
      return processBatch(
        request,
        async (integrationId, signal) => {
          const response = await api.post(
            `/integrations/${integrationId}/test`,
            { timeout: request.timeout },
            { signal }
          );
          return response.data;
        },
        'test connection'
      );
    },
  });

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  // Cancel operation
  const cancelOperation = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  // Generate confirmation token for destructive operations
  const generateConfirmationToken = useCallback((): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `bulk-${timestamp}-${random}`;
  }, []);

  // Validate selection
  const validateSelection = useCallback((
    integrationIds: string[],
    integrations: Integration[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (integrationIds.length === 0) {
      errors.push('No integrations selected');
    }

    if (integrationIds.length > 50) {
      errors.push('Cannot process more than 50 integrations at once');
    }

    // Check if all selected integrations exist
    const existingIds = new Set(integrations.map(i => i.id));
    const missingIds = integrationIds.filter(id => !existingIds.has(id));
    if (missingIds.length > 0) {
      errors.push(`Selected integrations not found: ${missingIds.join(', ')}`);
    }

    // Check for integrations that might not support certain operations
    const selectedIntegrations = integrations.filter(i => integrationIds.includes(i.id));
    const inactiveIntegrations = selectedIntegrations.filter(i => !i.isActive);
    if (inactiveIntegrations.length > 0) {
      errors.push(`Some selected integrations are inactive: ${inactiveIntegrations.map(i => i.metadata?.displayName || i.id).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, []);

  return {
    // State
    progress,
    isProcessing,
    
    // Operations
    refreshTokens: refreshTokensMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteIntegrations: deleteIntegrationsMutation.mutateAsync,
    testConnections: testConnectionsMutation.mutateAsync,
    
    // Progress management
    resetProgress,
    cancelOperation,
    
    // Utilities
    generateConfirmationToken,
    validateSelection,
  };
};

// Hook for bulk operation UI state management
export const useBulkOperationUI = () => {
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<{
    type: 'refresh' | 'delete' | 'activate' | 'deactivate' | 'test';
    data?: any;
  } | null>(null);

  const toggleSelection = useCallback((integrationId: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId)
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  }, []);

  const selectAll = useCallback((integrationIds: string[]) => {
    setSelectedIntegrations(integrationIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIntegrations([]);
  }, []);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedIntegrations([]);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIntegrations([]);
  }, []);

  const confirmOperation = useCallback((
    type: 'refresh' | 'delete' | 'activate' | 'deactivate' | 'test',
    data?: any
  ) => {
    setPendingOperation({ type, data });
    setShowConfirmDialog(true);
  }, []);

  const cancelOperation = useCallback(() => {
    setPendingOperation(null);
    setShowConfirmDialog(false);
  }, []);

  return {
    // Selection state
    selectedIntegrations,
    isSelectionMode,
    
    // Dialog state
    showConfirmDialog,
    pendingOperation,
    
    // Selection actions
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    
    // Operation actions
    confirmOperation,
    cancelOperation,
  };
};