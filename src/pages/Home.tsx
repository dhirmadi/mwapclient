import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Button, Group, Card, SimpleGrid, ThemeIcon, Box, Stack, Paper, Menu, Avatar, ActionIcon, Tooltip, Loader } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBuildingSkyscraper, IconFolder, IconCloud, IconTemplate, IconUser, IconPlus, IconLogout, IconSettings } from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';
import { useProjects } from '../hooks/useProjects';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isSuperAdmin, isTenantOwner, logout, roles } = useAuth();
  const { currentTenant, isLoadingCurrentTenant } = useTenants();
  const [hasNoTenant, setHasNoTenant] = useState<boolean>(false);
  
  // Get tenant integrations
  const { 
    data: tenantIntegrations, 
    isLoading: isLoadingIntegrations 
  } = useTenants().useTenantIntegrations(roles?.tenantId);
  
  // Get projects
  const { 
    projects, 
    isLoading: isLoadingProjects 
  } = useProjects();
  
  // Determine what quick actions to show for tenant owners
  const [hasIntegrations, setHasIntegrations] = useState<boolean>(false);
  const [hasProjects, setHasProjects] = useState<boolean>(false);
  
  useEffect(() => {
    if (isTenantOwner && tenantIntegrations) {
      setHasIntegrations(tenantIntegrations.length > 0);
    }
    
    if (isTenantOwner && projects) {
      setHasProjects(projects.length > 0);
    }
  }, [isTenantOwner, tenantIntegrations, projects]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Handle profile navigation
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  // Check if user has no tenant
  useEffect(() => {
    if (isAuthenticated && !isLoadingCurrentTenant && !isSuperAdmin) {
      setHasNoTenant(!currentTenant);
    }
  }, [isAuthenticated, isLoadingCurrentTenant, currentTenant, isSuperAdmin]);

  return (
    <Container size="lg" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder mb="xl">
        <Title order={1} mb="md" align="center" color="blue">Welcome to MWAP</Title>
        <Text size="lg" mb="xl" align="center" color="dimmed">
          Modular Web Application Platform
        </Text>
      </Paper>
      
      {isAuthenticated ? (
        <>
          <Paper shadow="sm" p="md" radius="md" withBorder mb="xl">
            <Group justify="space-between" align="center">
              <Box>
                <Group align="center" gap="xs">
                  <Title order={3} mb="xs" style={{ cursor: 'pointer' }} onClick={handleProfileClick}>
                    Hello, {user?.name}!
                  </Title>
                  <Tooltip label="View Profile">
                    <ActionIcon 
                      color={isSuperAdmin ? 'red' : isTenantOwner ? 'blue' : 'green'} 
                      variant="subtle"
                      onClick={handleProfileClick}
                    >
                      <IconSettings size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Text>
                  You are logged in as a 
                  <Text component="span" weight={700} color={isSuperAdmin ? 'red' : isTenantOwner ? 'blue' : 'green'}>
                    {isSuperAdmin ? ' Super Admin' : isTenantOwner ? ' Tenant Owner' : ' Project Member'}
                  </Text>.
                </Text>
              </Box>
              <Group>
                <Tooltip label="Logout">
                  <ActionIcon 
                    color="gray" 
                    variant="subtle" 
                    onClick={handleLogout}
                    size="lg"
                  >
                    <IconLogout size={20} />
                  </ActionIcon>
                </Tooltip>
                <Menu position="bottom-end" shadow="md">
                  <Menu.Target>
                    <Avatar 
                      color={isSuperAdmin ? 'red' : isTenantOwner ? 'blue' : 'green'} 
                      radius="xl" 
                      style={{ cursor: 'pointer' }}
                    >
                      {user?.name?.charAt(0) || <IconUser size={24} />}
                    </Avatar>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Account</Menu.Label>
                    <Menu.Item 
                      leftSection={<IconUser size={14} />} 
                      onClick={handleProfileClick}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      leftSection={<IconLogout size={14} />} 
                      onClick={handleLogout}
                      color="red"
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </Paper>
          
          <Title order={2} mb="md">Quick Actions</Title>
          
          <SimpleGrid cols={3} spacing="md" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
            {hasNoTenant && !isSuperAdmin && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md" bg="teal.6">
                  <Group justify="space-between">
                    <Title order={3} c="white">Create Tenant</Title>
                    <ThemeIcon size="lg" radius="md" color="white" variant="outline">
                      <IconPlus size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">You don't have a tenant yet. Create your own tenant to get started.</Text>
                <Button component={Link} to="/tenants/create" variant="filled" color="teal" fullWidth>
                  Create Tenant
                </Button>
              </Card>
            )}
            
            {isSuperAdmin && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Tenants</Title>
                    <ThemeIcon size="lg" radius="md" color="blue">
                      <IconBuildingSkyscraper size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Manage organization tenants and their settings.</Text>
                <Button component={Link} to="/admin/tenants" variant="filled" color="blue" fullWidth>
                  Manage Tenants
                </Button>
              </Card>
            )}
            
            {/* Show loading state while fetching data */}
            {isTenantOwner && (isLoadingIntegrations || isLoadingProjects) && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Loading...</Title>
                    <Loader size="sm" />
                  </Group>
                </Card.Section>
                <Text mb="md">Loading tenant data...</Text>
              </Card>
            )}
            
            {/* Project Management - Show when tenant has integrations and projects */}
            {isTenantOwner && hasIntegrations && hasProjects && !(isLoadingIntegrations || isLoadingProjects) && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Projects</Title>
                    <ThemeIcon size="lg" radius="md" color="green">
                      <IconFolder size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Manage your tenant's projects.</Text>
                <Button component={Link} to="/projects" variant="filled" color="green" fullWidth>
                  Manage Projects
                </Button>
              </Card>
            )}
            
            {/* Create Project - Show when tenant has integrations but no projects */}
            {isTenantOwner && hasIntegrations && !hasProjects && !(isLoadingIntegrations || isLoadingProjects) && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md" bg="teal.6">
                  <Group justify="space-between">
                    <Title order={3} c="white">Create Project</Title>
                    <ThemeIcon size="lg" radius="md" color="white" variant="outline">
                      <IconPlus size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">You have cloud integrations set up. Create your first project to get started.</Text>
                <Button component={Link} to="/projects/create" variant="filled" color="teal" fullWidth>
                  Create Project
                </Button>
              </Card>
            )}
            
            {isSuperAdmin && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Cloud Providers</Title>
                    <ThemeIcon size="lg" radius="md" color="violet">
                      <IconCloud size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Configure cloud storage providers for the platform.</Text>
                <Button component={Link} to="/admin/cloud-providers" variant="filled" color="violet" fullWidth>
                  Manage Providers
                </Button>
              </Card>
            )}
            
            {isSuperAdmin && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Project Types</Title>
                    <ThemeIcon size="lg" radius="md" color="orange">
                      <IconTemplate size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Define and configure project templates and types.</Text>
                <Button component={Link} to="/admin/project-types" variant="filled" color="orange" fullWidth>
                  Manage Types
                </Button>
              </Card>
            )}
            
            {isSuperAdmin && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Project Administration</Title>
                    <ThemeIcon size="lg" radius="md" color="grape">
                      <IconFolder size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Administer all projects across tenants.</Text>
                <Button component={Link} to="/admin/projects" variant="filled" color="grape" fullWidth>
                  Administer Projects
                </Button>
              </Card>
            )}
            
            {/* Tenant Settings - Always show for tenant owners */}
            {isTenantOwner && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Tenant Settings</Title>
                    <ThemeIcon size="lg" radius="md" color="cyan">
                      <IconBuildingSkyscraper size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Configure your organization's settings and preferences.</Text>
                <Button component={Link} to="/tenant/settings" variant="filled" color="cyan" fullWidth>
                  Tenant Settings
                </Button>
              </Card>
            )}
            
            {/* Cloud Integrations - Always show for tenant owners */}
            {isTenantOwner && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Cloud Integrations</Title>
                    <ThemeIcon size="lg" radius="md" color="indigo">
                      <IconCloud size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">
                  {hasIntegrations 
                    ? "Manage your organization's cloud provider integrations." 
                    : "Set up cloud integrations to enable project creation."}
                </Text>
                <Button 
                  component={Link} 
                  to="/tenant/integrations" 
                  variant="filled" 
                  color={hasIntegrations ? "indigo" : "teal"}
                  fullWidth
                >
                  {hasIntegrations ? "Manage Integrations" : "Set Up Integrations"}
                </Button>
              </Card>
            )}
          </SimpleGrid>
        </>
      ) : (
        <Card shadow="md" p="xl" radius="md" withBorder>
          <Stack align="center" spacing="md">
            <Title order={2}>Get Started</Title>
            <Text size="lg" align="center" mb="xl">
              Please log in to access the Modular Web Application Platform.
            </Text>
            
            <Button component={Link} to="/login" variant="filled" color="blue" size="lg">
              Log In
            </Button>
          </Stack>
        </Card>
      )}
    </Container>
  );
};

export default Home;