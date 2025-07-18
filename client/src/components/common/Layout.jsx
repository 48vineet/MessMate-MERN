// src/components/common/Layout.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children, showSidebar = true, showFooter = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header 
        user={user}
        onToggleSidebar={toggleSidebar}
        showSearch={true}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="hidden lg:block lg:w-72 bg-white shadow-lg">
            <Sidebar 
              isOpen={true}
              onClose={closeSidebar}
              userRole={user?.role || 'student'}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        {showSidebar && isMobile && (
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            userRole={user?.role || 'student'}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          {showFooter && (
            <Footer />
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MessMate
            </h2>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Layout;
