import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useNotification = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const showSuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };
};