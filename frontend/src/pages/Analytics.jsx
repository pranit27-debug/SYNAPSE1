import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const Analytics = () => {
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
            Analytics
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Track your productivity and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
      </motion.div>

      {/* Analytics Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                This page will contain comprehensive analytics including productivity charts, 
                task completion trends, time tracking insights, and performance metrics.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Productivity Trends
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                  <Target className="w-8 h-8 text-success-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Goal Tracking
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                  <Calendar className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Time Analysis
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;
