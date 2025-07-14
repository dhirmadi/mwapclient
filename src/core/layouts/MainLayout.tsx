import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mantine/core';

const MainLayout: React.FC = () => {
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
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;