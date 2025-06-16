import { NotificationType } from '../components/notifications/CustomNotification';

/**
 * Custom notification service that doesn't rely on Mantine's notifications
 * Uses a combination of sessionStorage and custom events
 */

// Show a notification immediately if on the same page
export const showNotification = (props: {
  title?: string;
  message: string;
  type?: NotificationType;
}) => {
  try {
    // Dispatch a custom event to show the notification
    const event = new CustomEvent('custom-notification', {
      detail: {
        id: Date.now().toString(),
        title: props.title,
        message: props.message,
        type: props.type || 'info'
      }
    });
    
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

// Store a notification for the next page
export const storeNotification = (props: {
  title?: string;
  message: string;
  type?: NotificationType;
}) => {
  try {
    // Store notification in session storage for retrieval after navigation
    sessionStorage.setItem('appNotification', JSON.stringify({
      title: props.title,
      message: props.message,
      color: props.type === 'success' ? 'green' : 
             props.type === 'error' ? 'red' : 'blue'
    }));
  } catch (error) {
    console.error('Failed to store notification in session storage:', error);
  }
};

// Show a success notification
export const showSuccess = (message: string, title: string = 'Success') => {
  showNotification({
    title,
    message,
    type: 'success'
  });
};

// Show an error notification
export const showError = (message: string, title: string = 'Error') => {
  showNotification({
    title,
    message,
    type: 'error'
  });
};

// Store a success notification for the next page
export const storeSuccess = (message: string, title: string = 'Success') => {
  storeNotification({
    title,
    message,
    type: 'success'
  });
};

// Store an error notification for the next page
export const storeError = (message: string, title: string = 'Error') => {
  storeNotification({
    title,
    message,
    type: 'error'
  });
};