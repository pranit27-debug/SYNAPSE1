import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Shield, Bell, Palette, Key } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Profile
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Button variant="primary" size="lg">
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Profile Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {user?.username || 'User'}
                </h4>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Member since</span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">Status</span>
                  <span className="px-2 py-1 text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Account Settings
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Personal Info</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Update your details</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent-100 dark:bg-accent-900/20 rounded-lg">
                        <Shield className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Security</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Password & MFA</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                        <Bell className="w-5 h-5 text-success-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Notifications</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Email & alerts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                        <Palette className="w-5 h-5 text-warning-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-white">Appearance</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Theme & layout</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <Button variant="outline" fullWidth>
                    <Key className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
