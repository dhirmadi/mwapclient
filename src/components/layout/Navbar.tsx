import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Menu, UnstyledButton, Burger, Drawer, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconUser, IconChevronDown } from '@tabler/icons-react';

const Navbar: React.FC = () => {
  const { user, logout, isSuperAdmin, isTenantOwner } = useAuth();
  const location = useLocation();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      visible: true,
    },
    {
      name: 'Tenants',
      path: '/admin/tenants',
      visible: isSuperAdmin,
    },
    {
      name: 'Projects',
      path: '/projects',
      visible: !isSuperAdmin || isTenantOwner,
    },
    {
      name: 'Cloud Providers',
      path: '/admin/cloud-providers',
      visible: isSuperAdmin,
    },
    {
      name: 'Project Types',
      path: '/admin/project-types',
      visible: isSuperAdmin,
    },
  ];

  const filteredNavItems = navItems.filter(item => item.visible);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                MWAP
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User menu (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Menu 
                width={200} 
                position="bottom-end" 
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
              >
                <Menu.Target>
                  <UnstyledButton className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                      <Text fw={500} size="sm" className="hidden md:block">
                        {user.name}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} className={userMenuOpened ? 'rotate-180' : ''} />
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
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className="m-2"
              size="sm"
              aria-label="Toggle navigation"
            />
          </div>
        </div>
      </div>

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
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 mb-1 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
                onClick={closeDrawer}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* User section at bottom of drawer */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {user ? (
              <>
                <div className="flex items-center px-4 mb-4">
                  <Avatar
                    src={user.picture}
                    alt={user.name}
                    radius="xl"
                    size={40}
                    color="blue"
                  >
                    {getUserInitials()}
                  </Avatar>
                  <div className="ml-3">
                    <Text fw={500} size="sm">{user.name}</Text>
                    <Text size="xs" c="dimmed">{user.email}</Text>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    onClick={closeDrawer}
                  >
                    <IconUser size={18} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeDrawer();
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-md"
                  >
                    <IconLogout size={18} className="mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeDrawer}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;