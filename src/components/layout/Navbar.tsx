import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Avatar, 
  Menu, 
  UnstyledButton, 
  Burger, 
  Drawer, 
  Group, 
  Text, 
  Box,
  Button,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconLogout, 
  IconUser, 
  IconChevronDown, 
  IconDashboard, 
  IconBuildingSkyscraper, 
  IconFolder, 
  IconCloud, 
  IconTemplate, 
  IconSettings, 
  IconUsers 
} from '@tabler/icons-react';

/**
 * Main navigation component with responsive design
 */
const Navbar: React.FC = () => {
  const { user, logout, isSuperAdmin, isTenantOwner } = useAuth();
  const location = useLocation();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Define navigation items based on user roles
  const navItems = [
    // Common items
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <IconDashboard size={18} />,
      visible: true,
    },
    
    // SuperAdmin items
    {
      name: 'Tenants',
      path: '/admin/tenants',
      icon: <IconBuildingSkyscraper size={18} />,
      visible: isSuperAdmin,
    },
    {
      name: 'Cloud Providers',
      path: '/admin/cloud-providers',
      icon: <IconCloud size={18} />,
      visible: isSuperAdmin,
    },
    {
      name: 'Templates',
      path: '/admin/templates',
      icon: <IconTemplate size={18} />,
      visible: isSuperAdmin,
    },
    
    // Tenant Owner items
    {
      name: 'Projects',
      path: '/projects',
      icon: <IconFolder size={18} />,
      visible: true,
    },
    {
      name: 'Users',
      path: '/users',
      icon: <IconUsers size={18} />,
      visible: isTenantOwner,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <IconSettings size={18} />,
      visible: isTenantOwner,
    },
  ];

  // Filter visible nav items
  const filteredNavItems = navItems.filter(item => item.visible);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return '';
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      component="nav"
      sx={(theme) => ({
        backgroundColor: theme.white,
        boxShadow: theme.shadows.xs,
        marginBottom: theme.spacing.md
      })}
    >
      <Box
        sx={(theme) => ({
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${theme.spacing.md}`
        })}
      >
        <Group justify="space-between" h={60}>
          <Group>
            <Link 
              to="/" 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: '#3182ce', 
                textDecoration: 'none'
              }}
            >
              MWAP
            </Link>
            <Group ml="md" display={{ base: 'none', sm: 'flex' }} gap="lg">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: isActive(item.path) ? '2px solid #3182ce' : '2px solid transparent',
                    color: isActive(item.path) ? '#1a202c' : '#718096',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </Group>
          </Group>
          
          {/* User menu (desktop) */}
          <Group display={{ base: 'none', sm: 'flex' }}>
            {user ? (
              <Menu 
                width={200} 
                position="bottom-end" 
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
              >
                <Menu.Target>
                  <UnstyledButton style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '9999px',
                    padding: '0.25rem',
                    transition: 'all 0.2s'
                  }}>
                    <Group gap={7}>
                      <Avatar
                        src={user.picture}
                        alt={user.name}
                        radius="xl"
                        size={30}
                        color="blue"
                      >
                        {getUserInitials()}
                      </Avatar>
                      <Text fw={500} size="sm" display={{ base: 'none', md: 'block' }}>
                        {user.name}
                      </Text>
                      <IconChevronDown 
                        size={12} 
                        stroke={1.5} 
                        style={{ 
                          transform: userMenuOpened ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconUser size={14} stroke={1.5} />}
                    component={Link}
                    to="/profile"
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={14} stroke={1.5} />}
                    onClick={logout}
                    color="red"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="filled"
                color="blue"
              >
                Login
              </Button>
            )}
          </Group>
          
          {/* Mobile menu button */}
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            size="sm"
            aria-label="Toggle navigation"
            display={{ base: 'block', sm: 'none' }}
          />
        </Group>
      </Box>

      {/* Mobile menu drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        zIndex={1000}
        position="right"
      >
        <Box mt="md">
          {filteredNavItems.map((item) => (
            <Box 
              key={item.path}
              component={Link}
              to={item.path}
              sx={(theme) => ({
                display: 'block',
                padding: theme.spacing.sm,
                borderLeft: isActive(item.path) 
                  ? `4px solid ${theme.colors.blue[6]}` 
                  : '4px solid transparent',
                backgroundColor: isActive(item.path) 
                  ? theme.colors.blue[0] 
                  : 'transparent',
                color: isActive(item.path) 
                  ? theme.colors.blue[8] 
                  : theme.colors.gray[6],
                fontWeight: 500,
                textDecoration: 'none',
                marginBottom: theme.spacing.xs,
                transition: 'all 0.2s'
              })}
              onClick={closeDrawer}
            >
              <Group>
                {item.icon}
                <Text>{item.name}</Text>
              </Group>
            </Box>
          ))}
        </Box>

        {user && (
          <Box mt="xl">
            <Divider my="md" />
            <Group p="md">
              <Avatar
                src={user.picture}
                alt={user.name}
                radius="xl"
                size={40}
                color="blue"
              >
                {getUserInitials()}
              </Avatar>
              <Box>
                <Text fw={500}>{user.name}</Text>
                <Text size="sm" c="dimmed">{user.email}</Text>
              </Box>
            </Group>
            <Box mt="md">
              <Box
                component={Link}
                to="/profile"
                sx={(theme) => ({
                  display: 'block',
                  padding: theme.spacing.sm,
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  textDecoration: 'none',
                  marginBottom: theme.spacing.xs,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.colors.gray[0]
                  }
                })}
                onClick={closeDrawer}
              >
                <Group>
                  <IconUser size={16} />
                  <Text>Profile</Text>
                </Group>
              </Box>
              <Box
                component="button"
                onClick={() => {
                  logout();
                  closeDrawer();
                }}
                sx={(theme) => ({
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: theme.spacing.sm,
                  color: theme.colors.red[6],
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.colors.gray[0]
                  }
                })}
              >
                <Group>
                  <IconLogout size={16} />
                  <Text>Logout</Text>
                </Group>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default Navbar;