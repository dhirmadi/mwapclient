import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, CloseButton, Box } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationProps {
  id?: string;
  title?: string;
  message: string;
  type?: NotificationType;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Custom notification component that doesn't rely on Mantine's notifications system
 */
export const CustomNotification: React.FC<NotificationProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IconCheck size={20} color="white" />;
      case 'error':
        return <IconX size={20} color="white" />;
      case 'info':
      default:
        return <IconInfoCircle size={20} color="white" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#51CF66';
      case 'error':
        return '#FF6B6B';
      case 'info':
      default:
        return '#339AF0';
    }
  };

  return (
    <Paper
      shadow="md"
      p="md"
      radius="md"
      withBorder
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${getColor()}`,
      }}
    >
      <Group position="apart" noWrap>
        <Group noWrap spacing="xs">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: getColor(),
            }}
          >
            {getIcon()}
          </Box>
          <div>
            {title && (
              <Text weight={500} size="sm">
                {title}
              </Text>
            )}
            <Text color="dimmed" size="sm">
              {message}
            </Text>
          </div>
        </Group>
        <CloseButton onClick={handleClose} />
      </Group>
    </Paper>
  );
};