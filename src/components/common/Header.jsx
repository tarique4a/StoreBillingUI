import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import {
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentShop, shops, switchShop } = useShop();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page-header">
      <div className="flex h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Shop Selector */}
        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
          {currentShop && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                <span className="truncate max-w-xs">{currentShop.shopName}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Switch Shop
                    </div>
                    {shops.map((shop) => (
                      <Menu.Item key={shop.id}>
                        {({ active }) => (
                          <button
                            onClick={() => switchShop(shop)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } ${
                              currentShop.id === shop.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                            } group flex items-center w-full px-4 py-2 text-sm`}
                          >
                            <BuildingStorefrontIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{shop.shopName}</div>
                              <div className="text-xs text-gray-500">{shop.city}</div>
                            </div>
                            {currentShop.id === shop.id && (
                              <div className="ml-2 h-2 w-2 bg-primary-600 rounded-full"></div>
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                    <div className="border-t border-gray-100">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => navigate('/shops/create')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Shop
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="bg-white flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 px-3 py-2 border border-gray-300 hover:bg-gray-50">
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
                <span className="hidden md:block text-gray-700 font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      Your Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/settings')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <CogIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-100">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;
