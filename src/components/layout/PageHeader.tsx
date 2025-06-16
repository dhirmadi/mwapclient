import React from 'react';
import { Button, Title, Text, Group, Box, Divider } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

/**
 * Page header component with title, description and optional action button
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionText,
  onAction,
  children,
}) => {
  return (
    <Box mb="xl" style={{ paddingTop: '1rem' }}>
      <Group justify="space-between" mb="md">
        <Box>
          <Title order={1} size="h2" fw={700} mb="xs">{title}</Title>
          {description && (
            <Text c="dimmed" size="sm">{description}</Text>
          )}
        </Box>
        <Group>
          {actionText && onAction && (
            <Button onClick={onAction}>{actionText}</Button>
          )}
          {children}
        </Group>
      </Group>
      <Divider mb="lg" />
    </Box>
  );
};

export default PageHeader;