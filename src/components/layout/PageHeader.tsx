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
    <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-3">
        {actionText && onAction && (
          <Button onClick={onAction}>{actionText}</Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;