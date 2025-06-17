import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../components/common';
import { Button, Card, Group, Text, Badge, Tabs, Alert } from '@mantine/core';
import { IconEdit, IconArrowLeft, IconUsers, IconSettings, IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

const TenantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [directTenantData, setDirectTenantData] = useState<any>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  
  // Use React Query hook
  const { 
    data: tenant, 
    isLoading, 
    error,
    refetch,
    isSuccess
  } = useTenant(id || '');
  
  // Fetch tenant data directly (as a backup)
  const fetchTenantDirectly = async () => {
    if (!id) return;
    
    try {
      setIsDirectLoading(true);
      console.log('Fetching tenant directly:', id);
      const data = await api.fetchTenantById(id);
      console.log('Direct fetch result:', data);
      setDirectTenantData(data);
      
      // Update the query cache with this data
      queryClient.setQueryData(['tenant', id], data);
    } catch (err) {
      console.error('Error fetching tenant directly:', err);
    } finally {
      setIsDirectLoading(false);
    }
  };
  
  // Log basic component info
  useEffect(() => {
    console.log('TenantDetails - Component Mounted, ID:', id);
    
    return () => {
      console.log('TenantDetails - Component Unmounted');
    };
  }, [id]);
  
  // Monitor tenant data changes
  useEffect(() => {
    // If no tenant data and not loading, try to refetch
    if (!tenant && !isLoading && !error) {
      console.log('No tenant data found, refetching...');
      refetch();
      
      // As a backup, also try to fetch directly
      fetchTenantDirectly();
    }
  }, [tenant, isLoading, error, refetch]);
  
  // Force refetch on mount
  useEffect(() => {
    // Clear the cache for this tenant and refetch
    queryClient.removeQueries({ queryKey: ['tenant', id] });
    setTimeout(() => {
      refetch();
      fetchTenantDirectly();
    }, 100);
  }, [id, queryClient, refetch]);

  const handleBack = () => {
    navigate('/admin/tenants');
  };

  const handleEdit = () => {
    navigate(`/admin/tenants/${id}/edit`);
  };
  
  const handleForceRefresh = () => {
    // Clear the cache and force a refetch
    queryClient.removeQueries({ queryKey: ['tenant', id] });
    refetch();
    fetchTenantDirectly();
  };
  
  // Determine which tenant data to use (from React Query or direct fetch)
  const effectiveTenant = tenant || directTenantData;

  if (isLoading && isDirectLoading) {
    return <LoadingSpinner size="xl" text="Loading tenant details..." />;
  }

  if (error && !effectiveTenant) {
    console.error('Error loading tenant:', error);
    return (
      <div>
        <PageHeader
          title="Error Loading Tenant"
          description={`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`}
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            Back to Tenants
          </Button>
          <Button onClick={handleForceRefresh} ml="md" leftSection={<IconRefresh size={16} />}>
            Force Refresh
          </Button>
        </PageHeader>
        

      </div>
    );
  }

  if (!effectiveTenant) {
    console.log('No tenant data available for ID:', id);
    return (
      <div>
        <PageHeader
          title="Tenant Not Found"
          description={`The tenant with ID ${id} could not be found`}
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            Back to Tenants
          </Button>
          <Button onClick={handleForceRefresh} ml="md" leftSection={<IconRefresh size={16} />}>
            Force Refresh
          </Button>
        </PageHeader>
        

      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={effectiveTenant.name}
        description={isSuperAdmin ? `Tenant ID: ${effectiveTenant.id || effectiveTenant._id}` : ''}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack} className="mr-2">
          Back
        </Button>
        {isSuperAdmin && (
          <Button leftSection={<IconEdit size={16} />} onClick={handleEdit} className="mr-2">
            Edit
          </Button>
        )}
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="subtle" 
          onClick={handleForceRefresh}
        >
          Refresh
        </Button>
      </PageHeader>

      <div className="mt-6">

        
        {!isSuperAdmin && (
          <Alert icon={<IconInfoCircle size={16} />} title="Limited View" color="blue" mb="md">
            You are viewing limited tenant information. Only tenant administrators can see all details.
          </Alert>
        )}
        
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group style={{ justifyContent: 'space-between' }} mb="md">
            <div>
              <Text fw={500} size="lg">Tenant Information</Text>
            </div>
            {isSuperAdmin && (
              <Badge color={effectiveTenant.active === false || effectiveTenant.archived === true ? 'red' : 'green'}>
                {effectiveTenant.active === false || effectiveTenant.archived === true ? 'Inactive' : 'Active'}
              </Badge>
            )}
          </Group>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="sm" color="dimmed">Name</Text>
              <Text>{effectiveTenant.name}</Text>
            </div>
            
            {/* Only show these fields to SuperAdmin */}
            {isSuperAdmin && (
              <>
                <div>
                  <Text size="sm" color="dimmed">Created</Text>
                  <Text>{new Date(effectiveTenant.createdAt).toLocaleString()}</Text>
                </div>
                {effectiveTenant.updatedAt && (
                  <div>
                    <Text size="sm" color="dimmed">Last Updated</Text>
                    <Text>{new Date(effectiveTenant.updatedAt).toLocaleString()}</Text>
                  </div>
                )}
                <div>
                  <Text size="sm" color="dimmed">Owner ID</Text>
                  <Text>{effectiveTenant.ownerId || 'No owner assigned'}</Text>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Only show tabs to SuperAdmin */}
        {isSuperAdmin && (
          <div className="mt-6">
            <Tabs defaultValue="users">
              <Tabs.List>
                <Tabs.Tab value="users" leftSection={<IconUsers size={14} />}>Users</Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>Settings</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="users" pt="xs">
                <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                  <Text>Tenant users will be displayed here</Text>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="settings" pt="xs">
                <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                  <Text>Tenant settings will be displayed here</Text>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default TenantDetails;