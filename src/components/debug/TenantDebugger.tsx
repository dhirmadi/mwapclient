import React from 'react';
import { Card, Text, Code, Button } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';

interface TenantDebuggerProps {
  tenantId: string;
  tenantData: any;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const TenantDebugger: React.FC<TenantDebuggerProps> = ({ 
  tenantId, 
  tenantData, 
  isLoading, 
  error, 
  refetch 
}) => {
  const queryClient = useQueryClient();
  
  // Get the data directly from the query cache
  const cachedData = queryClient.getQueryData(['tenant', tenantId]);
  
  const resetCache = () => {
    queryClient.resetQueries({ queryKey: ['tenant', tenantId] });
    setTimeout(() => {
      refetch();
    }, 100);
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder mt="md" style={{ backgroundColor: '#f8f9fa' }}>
      <Text fw={700} size="lg" mb="md">Tenant Data Debugger</Text>
      
      <div>
        <Text fw={500}>Tenant ID:</Text>
        <Code block>{tenantId}</Code>
      </div>
      
      <div className="mt-3">
        <Text fw={500}>Loading State:</Text>
        <Code block>{isLoading ? 'Loading...' : 'Not Loading'}</Code>
      </div>
      
      <div className="mt-3">
        <Text fw={500}>Error State:</Text>
        <Code block>{error ? JSON.stringify(error, null, 2) : 'No Error'}</Code>
      </div>
      
      <div className="mt-3">
        <Text fw={500}>Component Tenant Data:</Text>
        <Code block>{tenantData ? JSON.stringify(tenantData, null, 2) : 'No Data'}</Code>
      </div>
      
      <div className="mt-3">
        <Text fw={500}>Cached Tenant Data:</Text>
        <Code block>{cachedData ? JSON.stringify(cachedData, null, 2) : 'No Cached Data'}</Code>
      </div>
      
      <div className="mt-4">
        <Button onClick={refetch} mr="md">Refetch Data</Button>
        <Button onClick={resetCache} color="red">Reset Cache & Refetch</Button>
      </div>
    </Card>
  );
};

export default TenantDebugger;