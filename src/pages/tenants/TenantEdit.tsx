import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant, useUpdateTenant } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../components/common';
import { Button, TextInput, Switch, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

const tenantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  archived: z.boolean().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const TenantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [directTenantData, setDirectTenantData] = useState<any>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  
  // Use React Query hook
  const { 
    data: tenant, 
    isLoading: isFetching, 
    error: fetchError,
    refetch 
  } = useTenant(id || '');
  
  const { updateTenant, isUpdating, error: updateError } = useUpdateTenant();
  
  // Fetch tenant data directly (as a backup)
  const fetchTenantDirectly = async () => {
    if (!id) return;
    
    try {
      setIsDirectLoading(true);
      console.log('Fetching tenant directly for edit:', id);
      const data = await api.fetchTenantById(id);
      console.log('Direct fetch result for edit:', data);
      setDirectTenantData(data);
      
      // Update the query cache with this data
      queryClient.setQueryData(['tenant', id], data);
    } catch (err) {
      console.error('Error fetching tenant directly for edit:', err);
    } finally {
      setIsDirectLoading(false);
    }
  };
  
  // Force refetch on mount
  useEffect(() => {
    // Clear the cache for this tenant and refetch
    queryClient.removeQueries({ queryKey: ['tenant', id] });
    setTimeout(() => {
      refetch();
      fetchTenantDirectly();
    }, 100);
  }, [id, queryClient, refetch]);

  const form = useForm<TenantFormValues>({
    initialValues: {
      name: '',
      archived: false,
    },
    validate: zodResolver(tenantSchema),
  });

  // Determine which tenant data to use (from React Query or direct fetch)
  const effectiveTenant = tenant || directTenantData;
  
  // Update form when tenant data is available
  useEffect(() => {
    if (effectiveTenant) {
      form.setValues({
        name: effectiveTenant.name,
        archived: effectiveTenant.archived || false,
      });
    }
  }, [effectiveTenant]);
  
  const handleForceRefresh = () => {
    // Clear the cache and force a refetch
    queryClient.removeQueries({ queryKey: ['tenant', id] });
    refetch();
    fetchTenantDirectly();
  };

  const handleSubmit = (values: TenantFormValues) => {
    updateTenant({ 
      id: id || '', 
      data: values 
    }, {
      onSuccess: () => {
        navigate(`/admin/tenants/${id}`);
      },
    });
  };

  const handleBack = () => {
    navigate(`/admin/tenants/${id}`);
  };

  if (isFetching && isDirectLoading) {
    return <LoadingSpinner size="xl" text="Loading tenant..." />;
  }

  if (fetchError && !effectiveTenant) {
    return (
      <div>
        <PageHeader
          title="Error Loading Tenant"
          description={`An error occurred: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`}
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/admin/tenants')}>
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
    return (
      <div>
        <PageHeader
          title="Tenant Not Found"
          description="The requested tenant could not be found"
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/admin/tenants')}>
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
        title={`Edit Tenant: ${effectiveTenant.name}`}
        description={`Tenant ID: ${effectiveTenant.id || effectiveTenant._id}`}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack} className="mr-2">
          Back
        </Button>
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="subtle" 
          onClick={handleForceRefresh}
        >
          Refresh
        </Button>
      </PageHeader>

      {updateError && <ErrorDisplay error={updateError} className="mt-4" />}

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Tenant Name"
            placeholder="Enter tenant name"
            required
            {...form.getInputProps('name')}
            className="mb-4"
          />

          <Switch
            label="Archived"
            description="Toggle to archive this tenant"
            {...form.getInputProps('archived', { type: 'checkbox' })}
            className="mb-6"
          />

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default TenantEdit;