import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text, Group, Divider } from '@mantine/core';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        backgroundColor: theme.white,
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        marginTop: 'auto'
      })}
    >
      <Box
        sx={(theme) => ({
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing.md
        })}
      >
        <Group position="apart" align="center" sx={(theme) => ({
          flexDirection: 'column',
          [theme.fn.largerThan('md')]: {
            flexDirection: 'row'
          }
        })}>
          <Text 
            c="dimmed" 
            size="sm"
            mb={{ base: 'md', md: 0 }}
          >
            &copy; {currentYear} MWAP. All rights reserved.
          </Text>
          <Group spacing="lg">
            <Text 
              component={Link} 
              to="/terms" 
              c="dimmed" 
              size="sm"
              sx={(theme) => ({
                textDecoration: 'none',
                '&:hover': {
                  color: theme.black
                }
              })}
            >
              Terms of Service
            </Text>
            <Text 
              component={Link} 
              to="/privacy" 
              c="dimmed" 
              size="sm"
              sx={(theme) => ({
                textDecoration: 'none',
                '&:hover': {
                  color: theme.black
                }
              })}
            >
              Privacy Policy
            </Text>
            <Text 
              component={Link} 
              to="/contact" 
              c="dimmed" 
              size="sm"
              sx={(theme) => ({
                textDecoration: 'none',
                '&:hover': {
                  color: theme.black
                }
              })}
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