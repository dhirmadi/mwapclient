import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Button, Group, Card, SimpleGrid, ThemeIcon, Box, Stack, Paper } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBuildingSkyscraper, IconFolder, IconCloud, IconTemplate, IconUser, IconPlus } from '@tabler/icons-react';
import { useTenants } from '../hooks/useTenants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isSuperAdmin, isTenantOwner } = useAuth();
  const { currentTenant, isLoadingCurrentTenant } = useTenants();
  const [hasNoTenant, setHasNoTenant] = useState<boolean>(false);
  
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
                <Title order={3} mb="xs">Hello, {user?.name}!</Title>
                <Text>
                  You are logged in as a 
                  <Text component="span" weight={700} color={isSuperAdmin ? 'red' : isTenantOwner ? 'blue' : 'green'}>
                    {isSuperAdmin ? ' Super Admin' : isTenantOwner ? ' Tenant Owner' : ' Project Member'}
                  </Text>.
                </Text>
              </Box>
              <ThemeIcon size="xl" radius="xl" color={isSuperAdmin ? 'red' : isTenantOwner ? 'blue' : 'green'}>
                <IconUser size={24} />
              </ThemeIcon>
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
            
            {isTenantOwner && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Tenant Management</Title>
                    <ThemeIcon size="lg" radius="md" color="green">
                      <IconFolder size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Manage your tenant's projects and cloud integrations.</Text>
                <Button component={Link} to="/tenant/management" variant="filled" color="green" fullWidth>
                  Manage Tenant
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
            
            {isTenantOwner && (
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group justify="space-between">
                    <Title order={3}>Integrations</Title>
                    <ThemeIcon size="lg" radius="md" color="indigo">
                      <IconCloud size={20} />
                    </ThemeIcon>
                  </Group>
                </Card.Section>
                <Text mb="md">Manage your organization's cloud provider integrations.</Text>
                <Button component={Link} to="/tenant/integrations" variant="filled" color="indigo" fullWidth>
                  Manage Integrations
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