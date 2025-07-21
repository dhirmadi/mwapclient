import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import { Box } from '@mantine/core';
import { useBreadcrumbs } from '../../shared/hooks/useBreadcrumbs';

const MainLayout: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      <Navbar />
      <Box
        component="main"
        style={{
          flexGrow: 1
        }}
      >
        <Box
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px'
          }}
        >
          <Breadcrumbs items={breadcrumbs} />
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;