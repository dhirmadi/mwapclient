import { notifications } from '@mantine/notifications';

/**
 * Safe notification utility that prevents white screen errors
 * by catching and logging any notification-related errors
 */
export const showNotification = (props: {
  title?: string;
  message: string;
  color?: string;
  icon?: React.ReactNode;
}) => {
  try {
    // Store notification in session storage for retrieval after navigation
    sessionStorage.setItem('appNotification', JSON.stringify({
      title: props.title,
      message: props.message,
      color: props.color || 'blue',
    }));
  } catch (error) {
    console.error('Failed to store notification in session storage:', error);
  }
};

/**
 * Check for stored notifications and display them
 */
export const checkForStoredNotifications = () => {
  try {
    const storedNotification = sessionStorage.getItem('appNotification');
    if (storedNotification) {
      const notification = JSON.parse(storedNotification);
      
      // Use setTimeout to ensure the component is fully mounted
      setTimeout(() => {
        try {
          notifications.show({
            title: notification.title,
            message: notification.message,
            color: notification.color,
          });
        } catch (error) {
          console.error('Failed to show notification:', error);
        }
      }, 100);
      
      // Clear the stored notification
      sessionStorage.removeItem('appNotification');
    }
    
    // Also check for the cloud provider specific message for backward compatibility
    const cloudProviderMessage = sessionStorage.getItem('cloudProviderMessage');
    if (cloudProviderMessage) {
      try {
        const { type, message } = JSON.parse(cloudProviderMessage);
        
        // Use setTimeout to ensure the component is fully mounted
        setTimeout(() => {
          try {
            notifications.show({
              title: type === 'success' ? 'Success' : 'Error',
              message,
              color: type === 'success' ? 'green' : 'red',
            });
          } catch (error) {
            console.error('Failed to show cloud provider notification:', error);
          }
        }, 100);
        
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