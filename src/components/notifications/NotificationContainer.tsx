import React, { useState, useEffect } from 'react';
import { Stack, Box } from '@mantine/core';
import { CustomNotification, NotificationType } from './CustomNotification';

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
}

/**
 * Container for displaying notifications
 * This component doesn't rely on Mantine's notifications system
 */
const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Check for stored notifications on mount
  useEffect(() => {
    checkForStoredNotifications();

    // Set up event listener for custom notification events
    window.addEventListener('custom-notification', handleNotificationEvent);
    
    return () => {
      window.removeEventListener('custom-notification', handleNotificationEvent);
    };
  }, []);

  // Handle custom notification events
  const handleNotificationEvent = (event: Event) => {
    const customEvent = event as CustomEvent<NotificationItem>;
    if (customEvent.detail) {
      addNotification(customEvent.detail);
    }
  };

  // Check for notifications stored in sessionStorage
  const checkForStoredNotifications = () => {
    try {
      // Check for app notifications
      const storedNotification = sessionStorage.getItem('appNotification');
      if (storedNotification) {
        const notification = JSON.parse(storedNotification);
        addNotification({
          id: Date.now().toString(),
          title: notification.title,
          message: notification.message,
          type: notification.color === 'green' ? 'success' : 
                notification.color === 'red' ? 'error' : 'info'
        });
        
        // Clear the stored notification
        sessionStorage.removeItem('appNotification');
      }
      
      // Check for cloud provider messages (for backward compatibility)
      const cloudProviderMessage = sessionStorage.getItem('cloudProviderMessage');
      if (cloudProviderMessage) {
        try {
          const { type, message } = JSON.parse(cloudProviderMessage);
          addNotification({
            id: Date.now().toString(),
            title: type === 'success' ? 'Success' : 'Error',
            message,
            type: type === 'success' ? 'success' : 'error'
          });
          
          // Clear the stored message
          sessionStorage.removeItem('cloudProviderMessage');
        } catch (error) {
          console.error('Failed to parse cloud provider message:', error);
          sessionStorage.removeItem('cloudProviderMessage');
        }
      }
    } catch (error) {
      console.error('Error checking for stored notifications:', error);
    }
  };

  // Add a new notification
  const addNotification = (notification: NotificationItem) => {
    setNotifications(prev => [...prev, notification]);
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        width: 320,
      }}
    >
      <Stack spacing="md">
        {notifications.map(notification => (
          <CustomNotification
            key={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NotificationContainer;