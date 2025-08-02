import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Transactions', href: '/transactions', icon: DocumentTextIcon },
  { name: 'Invoices', href: '/invoices', icon: ReceiptPercentIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Store & Billing</h1>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className="mr-3 flex-shrink-0 h-5 w-5"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
