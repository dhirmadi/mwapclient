import React from 'react';
import { Button } from '@mantine/core';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`glass-panel text-center py-12 px-8 rounded-xl ${className}`}>
      {icon && (
        <div className="mx-auto flex justify-center text-primary-400 opacity-80">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-dark-300">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button 
            onClick={onAction}
            className="glass-button"
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;