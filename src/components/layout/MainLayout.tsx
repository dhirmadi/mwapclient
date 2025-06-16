import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarNew from './NavbarNew';
import Footer from './Footer';
import { Box } from '@mantine/core';

const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      <NavbarNew />
      <Box
        component="main"
        sx={{
          flexGrow: 1
        }}
      >
        <Box
          sx={(theme) => ({
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${theme.spacing.md} ${theme.spacing.md}`
          })}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;