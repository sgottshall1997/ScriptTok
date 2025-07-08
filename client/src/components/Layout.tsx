import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop: w-64, Mobile: overlay */}
      <Sidebar />
      
      {/* Main content - Full width on mobile, flexible on desktop */}
      <main className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-6 lg:p-8">
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;