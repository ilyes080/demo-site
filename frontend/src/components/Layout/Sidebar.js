import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  SparklesIcon,
  XMarkIcon,
  WifiIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, userType }) => {
  const { t } = useTranslation();
  
  const baseNavigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('navigation.restaurants'), href: '/restaurants', icon: BuildingStorefrontIcon },
    { name: t('navigation.inventory'), href: '/inventory', icon: ArchiveBoxIcon },
    { name: t('navigation.recipes'), href: '/recipes', icon: DocumentTextIcon },
    { name: t('navigation.orders'), href: '/orders', icon: DocumentTextIcon },
    { name: t('navigation.aiCopilot'), href: '/ai-copilot', icon: SparklesIcon },
    { name: 'IoT Dashboard', href: '/iot-dashboard', icon: WifiIcon },
    { name: 'Finance Avancée', href: '/advanced-finance', icon: CurrencyEuroIcon },
    { name: t('navigation.enterprise'), href: '/enterprise', icon: ChartBarIcon },
  ];

  const chainNavigation = [
    { name: t('navigation.chains'), href: '/chains', icon: ChartBarIcon },
  ];

  const gastronomyNavigation = [
    { name: t('navigation.gastronomy'), href: '/gastronomy', icon: StarIcon },
  ];

  const navigation = [
    ...baseNavigation,
    ...(userType === 'chain' ? chainNavigation : []),
    ...(userType === 'gastronomy' ? gastronomyNavigation : []),
  ];

  return (
    <>
      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">RestaurantPro</h1>
          </div>
          
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${item.premium ? 'relative' : ''}`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar pour mobile */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">RestaurantPro</h1>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;