import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Avatar, Menu, UnstyledButton, Burger, Drawer, Group, Text, Tooltip } from '@mantine/core';
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
  IconMenu2
} from '@tabler/icons-react';

const Navbar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [navMenuOpened, setNavMenuOpened] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <IconDashboard size={20} stroke={1.5} />,
      roles: [UserRole.SUPER_ADMIN, UserRole.TENANT_OWNER, UserRole.TENANT_ADMIN, UserRole.PROJECT_ADMIN, UserRole.PROJECT_MEMBER],
    },
    {
      name: 'Tenants',
      path: '/tenants',
      icon: <IconBuildingSkyscraper size={20} stroke={1.5} />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: <IconFolder size={20} stroke={1.5} />,
      roles: [UserRole.TENANT_OWNER, UserRole.TENANT_ADMIN, UserRole.PROJECT_ADMIN, UserRole.PROJECT_MEMBER],
    },
    {
      name: 'Cloud Providers',
      path: '/cloud-providers',
      icon: <IconCloud size={20} stroke={1.5} />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: 'Project Types',
      path: '/project-types',
      icon: <IconTemplate size={20} stroke={1.5} />,
      roles: [UserRole.SUPER_ADMIN],
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );
  
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
    <nav className="glass-panel sticky top-0 z-50 backdrop-blur-md border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold futuristic-text">MWAP</span>
              <span className="ml-1 text-xs text-primary-300 font-light">PLATFORM</span>
            </Link>
          </div>
          
          {/* Right side navigation and user menu */}
          <div className="flex items-center space-x-4">
            {/* Navigation menu (desktop) */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              <Menu 
                width={220} 
                position="bottom-end" 
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setNavMenuOpened(false)}
                onOpen={() => setNavMenuOpened(true)}
              >
                <Menu.Target>
                  <UnstyledButton className="px-3 py-2 rounded-md text-dark-200 hover:text-white transition-colors duration-300">
                    <Group gap={7}>
                      <IconMenu2 size={20} stroke={1.5} />
                      <Text fw={500} size="sm">
                        Navigation
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} className={navMenuOpened ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown className="glass-panel border border-primary-500/30">
                  {filteredNavItems.map((item) => (
                    <Menu.Item
                      key={item.path}
                      leftSection={item.icon}
                      component={Link}
                      to={item.path}
                      className={isActive(item.path) ? 'bg-primary-600/30' : ''}
                    >
                      {item.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              
              {/* Individual nav items for larger screens */}
              <div className="hidden lg:flex lg:items-center lg:space-x-1">
                {filteredNavItems.map((item) => (
                  <Tooltip key={item.path} label={item.name} position="bottom" withArrow>
                    <Link
                      to={item.path}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        isActive(item.path)
                          ? 'text-white bg-primary-600/50 shadow-glow'
                          : 'text-dark-200 hover:text-white hover:bg-dark-700/50'
                      }`}
                    >
                      {item.icon}
                    </Link>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            {/* User menu (desktop) */}
            <div className="hidden sm:flex sm:items-center">
              {user ? (
                <Menu 
                  width={200} 
                  position="bottom-end" 
                  transitionProps={{ transition: 'pop-top-right' }}
                  onClose={() => setUserMenuOpened(false)}
                  onOpen={() => setUserMenuOpened(true)}
                >
                  <Menu.Target>
                    <UnstyledButton className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 p-1">
                      <Group gap={7}>
                        <Avatar
                          src={user.picture}
                          alt={user.name}
                          radius="xl"
                          size={32}
                          className="border-2 border-primary-500/50 shadow-glow"
                        >
                          {getUserInitials()}
                        </Avatar>
                        <Text fw={500} size="sm" className="hidden lg:block text-dark-200">
                          {user.name}
                        </Text>
                        <IconChevronDown size={12} stroke={1.5} className={`text-dark-200 ${userMenuOpened ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'}`} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown className="glass-panel border border-primary-500/30">
                    <Menu.Item
                      leftSection={<IconUser size={14} stroke={1.5} />}
                      component={Link}
                      to="/profile"
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Divider className="border-dark-700" />
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
                  className="glass-button"
                >
                  Login
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                className="text-dark-200"
                size="sm"
                aria-label="Toggle navigation"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={<span className="futuristic-text text-lg font-bold">MWAP Navigation</span>}
        classNames={{
          content: 'glass-panel border-l border-primary-500/30',
          header: 'border-b border-primary-500/30',
          title: 'text-white',
          close: 'text-white',
        }}
        zIndex={1000}
        position="right"
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-2 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-primary-600/30 text-white shadow-glow'
                    : 'text-dark-200 hover:bg-dark-700/50 hover:text-white'
                }`}
                onClick={closeDrawer}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* User section at bottom of drawer */}
          <div className="border-t border-primary-500/30 pt-4 mt-4">
            {user ? (
              <>
                <div className="flex items-center px-4 mb-4">
                  <Avatar
                    src={user.picture}
                    alt={user.name}
                    radius="xl"
                    size={40}
                    className="border-2 border-primary-500/50 shadow-glow"
                  >
                    {getUserInitials()}
                  </Avatar>
                  <div className="ml-3">
                    <Text fw={500} size="sm" className="text-white">{user.name}</Text>
                    <Text size="xs" c="dimmed">{user.email}</Text>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-base font-medium text-dark-200 hover:text-white hover:bg-dark-700/50 rounded-md transition-all duration-300"
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
                    className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-dark-700/50 rounded-md transition-all duration-300"
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
                  className="glass-button w-full flex items-center justify-center"
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