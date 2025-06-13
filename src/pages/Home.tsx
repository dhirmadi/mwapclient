import React from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user, isSuperAdmin, isTenantOwner } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Welcome to MWAP</Title>
      
      {isAuthenticated ? (
        <>
          <Text mb="xl">
            Hello, {user?.name}! You are logged in as a 
            {isSuperAdmin ? ' Super Admin' : isTenantOwner ? ' Tenant Owner' : ' Project Member'}.
          </Text>
          
          <Group>
            {isSuperAdmin && (
              <Button component={Link} to="/admin/tenants" variant="filled" color="blue">
                Manage Tenants
              </Button>
            )}
            
            {(isTenantOwner || !isSuperAdmin) && (
              <Button component={Link} to="/projects" variant="filled" color="blue">
                View Projects
              </Button>
            )}
            
            {isSuperAdmin && (
              <Button component={Link} to="/admin/cloud-providers" variant="outline" color="blue">
                Manage Cloud Providers
              </Button>
            )}
            
            {isSuperAdmin && (
              <Button component={Link} to="/admin/project-types" variant="outline" color="blue">
                Manage Project Types
              </Button>
            )}
          </Group>
        </>
      ) : (
        <>
          <Text mb="xl">
            Please log in to access the Modular Web Application Platform.
          </Text>
          
          <Button component={Link} to="/login" variant="filled" color="blue">
            Log In
          </Button>
        </>
      )}
    </Container>
  );
};

export default Home;