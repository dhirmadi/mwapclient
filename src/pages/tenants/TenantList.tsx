import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState, Pagination } from '../../components/common';
import { Button, Table, ActionIcon, Group, Badge, Text, Title, Divider } from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconArchive } from '@tabler/icons-react';

const TenantList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    tenants: tenantsData, 
    archivedTenants: archivedTenantsData,
    isLoading, 
    isLoadingArchived,
    error,
    archivedError
  } = useTenants(true);
  const [activePage, setActivePage] = React.useState(1);
  const [archivedPage, setArchivedPage] = React.useState(1);
  
  // Ensure tenants arrays are valid
  const activeTenantsArray = Array.isArray(tenantsData) ? tenantsData : [];
  const archivedTenantsArray = Array.isArray(archivedTenantsData) ? archivedTenantsData : [];
  
  // Filter out any archived tenants from the active list (in case the API doesn't do this)
  const activeTenantsFiltered = activeTenantsArray.filter(tenant => 
    tenant.archived !== true
  );
  
  // Calculate pagination
  const activeTotalPages = Math.ceil((activeTenantsFiltered.length || 0) / 10);
  const archivedTotalPages = Math.ceil((archivedTenantsArray.length || 0) / 10);

  const handleCreateTenant = () => {
    navigate('/admin/tenants/create');
  };

  const handleViewTenant = (id: string) => {
    navigate(`/admin/tenants/${id}`);
  };

  const handleEditTenant = (id: string) => {
    navigate(`/admin/tenants/${id}/edit`);
  };

  // Debug the API response
  React.useEffect(() => {
    if (tenantsData) {
      console.log('Active tenants data:', tenantsData);
      console.log('Is array?', Array.isArray(tenantsData));
      console.log('Length:', Array.isArray(tenantsData) ? tenantsData.length : 0);
    }
    
    if (archivedTenantsData) {
      console.log('Archived tenants data:', archivedTenantsData);
      console.log('Is array?', Array.isArray(archivedTenantsData));
      console.log('Length:', Array.isArray(archivedTenantsData) ? archivedTenantsData.length : 0);
    }
  }, [tenantsData, archivedTenantsData]);

  if (isLoading && isLoadingArchived) {
    return <LoadingSpinner size="xl" text="Loading tenants..." />;
  }

  if (error && archivedError) {
    return <ErrorDisplay error={error || archivedError} />;
  }

  if ((!activeTenantsFiltered || activeTenantsFiltered.length === 0) && 
      (!archivedTenantsArray || archivedTenantsArray.length === 0)) {
    return (
      <div>
        <PageHeader
          title="Tenants"
          description="Manage platform tenants"
          actionText="Create Tenant"
          onAction={handleCreateTenant}
        />
        <EmptyState
          title="No tenants found"
          description="Get started by creating your first tenant"
          actionText="Create Tenant"
          onAction={handleCreateTenant}
        />
      </div>
    );
  }

  // Create a reusable tenant table component
  const TenantTable = ({ tenants, title, emptyMessage, isArchived = false }) => {
    if (!tenants || tenants.length === 0) {
      return (
        <div className="mt-6">
          <Text fw={500} size="lg" mb="md">{title}</Text>
          <Text color="dimmed" italic>{emptyMessage}</Text>
        </div>
      );
    }
    
    return (
      <div className="mt-6">
        <Group style={{ justifyContent: 'space-between' }} mb="md">
          <Title order={3}>{title}</Title>
          {isArchived && <Badge color="gray" size="lg"><IconArchive size={14} style={{ marginRight: 5 }} /> Archived</Badge>}
        </Group>
        
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tenants.map((tenant: any) => (
              <Table.Tr key={tenant.id || tenant._id}>
                <Table.Td>
                  <Text fw={500}>{tenant.name}</Text>
                  <Text size="xs" color="dimmed">
                    {tenant.id || tenant._id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {tenant.ownerId ? (
                    <div>
                      <Text>Owner ID: {tenant.ownerId}</Text>
                    </div>
                  ) : (
                    <Text color="dimmed">No owner assigned</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={tenant.active === false || tenant.archived === true ? 'red' : 'green'}
                  >
                    {tenant.active === false || tenant.archived === true ? 'Inactive' : 'Active'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => handleViewTenant(tenant.id || tenant._id)}
                      title="View tenant"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="yellow"
                      onClick={() => handleEditTenant(tenant.id || tenant._id)}
                      title="Edit tenant"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      title="Delete tenant"
                      disabled
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        
        {(isArchived ? archivedTotalPages : activeTotalPages) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={isArchived ? archivedPage : activePage}
              totalPages={isArchived ? archivedTotalPages : activeTotalPages}
              onPageChange={isArchived ? setArchivedPage : setActivePage}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage platform tenants"
        actionText="Create Tenant"
        onAction={handleCreateTenant}
      />

      {/* Active Tenants Section */}
      <TenantTable 
        tenants={activeTenantsFiltered} 
        title="Active Tenants" 
        emptyMessage="No active tenants found" 
      />
      
      {/* Divider between sections */}
      {activeTenantsFiltered.length > 0 && archivedTenantsArray.length > 0 && (
        <Divider my="xl" />
      )}
      
      {/* Archived Tenants Section */}
      <TenantTable 
        tenants={archivedTenantsArray} 
        title="Archived Tenants" 
        emptyMessage="No archived tenants found" 
        isArchived={true}
      />
    </div>
  );
};

export default TenantList;