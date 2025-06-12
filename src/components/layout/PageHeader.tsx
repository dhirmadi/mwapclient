import React from 'react';
import { Button } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionText,
  onAction,
  children,
}) => {
  return (
    <div className="pb-6 mb-6 border-b border-primary-500 border-opacity-20 sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
          <span className="futuristic-text">{title}</span>
        </h1>
        {description && (
          <p className="mt-2 text-sm text-gray-300">{description}</p>
        )}
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-3">
        {actionText && onAction && (
          <Button 
            onClick={onAction}
            className="glass-button"
          >
            {actionText}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;