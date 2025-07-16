import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';

interface RedirectRouteProps {
  to: string;
  showNotification?: boolean;
  notificationMessage?: string;
}

/**
 * Component that redirects to a new route and optionally shows a deprecation notice
 */
const RedirectRoute: React.FC<RedirectRouteProps> = ({ 
  to, 
  showNotification = false, 
  notificationMessage 
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show deprecation notice if requested
    if (showNotification && notificationMessage) {
      notifications.show({
        title: 'Route Updated',
        message: notificationMessage,
        color: 'blue',
        icon: <IconInfoCircle size={16} />,
        autoClose: 5000,
      });
    }

    // Redirect to new route
    navigate(to, { replace: true });
  }, [navigate, to, showNotification, notificationMessage]);

  return null; // This component doesn't render anything
};

export default RedirectRoute;