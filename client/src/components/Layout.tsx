import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ModeSwitcher from './ModeSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop: w-64, Mobile: overlay */}
      <Sidebar />
      
      {/* Main content area with header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header with mode switcher */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Generation Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ModeSwitcher />
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 lg:p-8">
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;