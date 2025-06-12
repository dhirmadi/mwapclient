import React from 'react';
import { Modal, Button, Group, Text } from '@mantine/core';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) => {
  const variantStyles = {
    danger: {
      icon: (
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      confirmColor: 'red',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/20',
    },
    warning: {
      icon: (
        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      confirmColor: 'yellow',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
      glowColor: 'shadow-yellow-500/20',
    },
    info: {
      icon: (
        <svg className="h-6 w-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      confirmColor: 'blue',
      bgColor: 'bg-primary-900/20',
      borderColor: 'border-primary-500/30',
      glowColor: 'shadow-primary-500/20',
    },
  };

  const { icon, confirmColor, bgColor, borderColor, glowColor } = variantStyles[variant];

  return (
    <Modal 
      opened={isOpen} 
      onClose={onClose} 
      title={<span className="futuristic-text text-lg">{title}</span>}
      centered
      classNames={{
        content: `glass-panel ${bgColor} border ${borderColor} shadow-lg ${glowColor}`,
        header: 'border-b border-dark-700/50',
        title: 'text-white',
        close: 'text-white',
      }}
    >
      <div className="flex items-start mb-6 p-2">
        <div className="flex-shrink-0 mr-4">{icon}</div>
        <Text size="sm" className="text-dark-200">{message}</Text>
      </div>
      <Group justify="flex-end" mt="md">
        <Button 
          variant="subtle" 
          onClick={onClose} 
          disabled={isLoading}
          className="text-dark-300 hover:bg-dark-700/50 hover:text-white"
        >
          {cancelText}
        </Button>
        <Button
          color={confirmColor}
          onClick={onConfirm}
          loading={isLoading}
          className="glass-button"
        >
          {confirmText}
        </Button>
      </Group>
    </Modal>
  );
};

export default ConfirmDialog;