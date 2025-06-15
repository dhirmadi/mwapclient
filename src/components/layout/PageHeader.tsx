import React from 'react';
import { Title, Text, Group, Button, ActionIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  backLink?: string;
  backText?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionText,
  onAction,
  backLink,
  backText = 'Back',
  children,
}) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          {backLink && (
            <Group mb="xs">
              <ActionIcon
                component={Link}
                to={backLink}
                variant="subtle"
                color="gray"
                aria-label="Back"
              >
                <IconArrowLeft size={16} />
              </ActionIcon>
              <Text component={Link} to={backLink} size="sm" c="dimmed">
                {backText}
              </Text>
            </Group>
          )}
          <Title order={2}>{title}</Title>
          {description && (
            <Text c="dimmed" mt="xs">
              {description}
            </Text>
          )}
        </div>
        <div>
          {actionText && onAction && (
            <Button onClick={onAction}>{actionText}</Button>
          )}
          {children}
        </div>
      </Group>
    </div>
  );
};

export default PageHeader;