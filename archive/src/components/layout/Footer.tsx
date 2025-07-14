import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text, Group } from '@mantine/core';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
        marginTop: 'auto'
      }}
    >
      <Box
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px'
        }}
      >
        <Group justify="space-between" align="center">
          <Text 
            c="dimmed" 
            size="sm"
          >
            &copy; {currentYear} MWAP. All rights reserved.
          </Text>
          <Group gap="lg">
            <Text 
              component={Link} 
              to="/terms" 
              c="dimmed" 
              size="sm"
              style={{ textDecoration: 'none' }}
            >
              Terms of Service
            </Text>
            <Text 
              component={Link} 
              to="/privacy" 
              c="dimmed" 
              size="sm"
              style={{ textDecoration: 'none' }}
            >
              Privacy Policy
            </Text>
            <Text 
              component={Link} 
              to="/contact" 
              c="dimmed" 
              size="sm"
              style={{ textDecoration: 'none' }}
            >
              Contact
            </Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
};

export default Footer;