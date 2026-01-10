import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full ${getBackgroundColor(notification.type)} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform translate-x-0`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => onRemove(notification.id)}
                className={`inline-flex ${getTextColor(notification.type)} hover:opacity-75 focus:outline-none`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;