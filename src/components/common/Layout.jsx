import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Mobile sidebar */}
        <MobileSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
