import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Monitor,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setSystemTheme, isSystem } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <motion.div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700',
        'transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:inset-0'
      )}
      initial={{ x: -256 }}
      animate={{ x: sidebarOpen ? 0 : -256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-700">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-white">Synapse</span>
          </motion.div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <X className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <motion.a
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  'hover:bg-secondary-100 dark:hover:bg-secondary-700',
                  isActive 
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn(
                  'mr-3 h-5 w-5 transition-colors duration-200',
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-secondary-400 group-hover:text-secondary-600 dark:group-hover:text-secondary-300'
                )} />
                {item.name}
              </motion.a>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-secondary-200 dark:border-secondary-700 p-4">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const Header = () => (
    <header className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
        >
          <Menu className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
        </button>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <LogOut className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </button>
        </div>
      </div>
    </header>
  );

  const ThemeToggle = () => (
    <div className="flex items-center space-x-1 bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
      <button
        onClick={() => setSystemTheme()}
        className={cn(
          'p-2 rounded-md transition-all duration-200',
          isSystem 
            ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-soft' 
            : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
        )}
        title="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleTheme()}
        className={cn(
          'p-2 rounded-md transition-all duration-200',
          !isSystem && theme === 'light'
            ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-soft' 
            : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
        )}
        title="Light theme"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => toggleTheme()}
        className={cn(
          'p-2 rounded-md transition-all duration-200',
          !isSystem && theme === 'dark'
            ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-soft' 
            : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
        )}
        title="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
