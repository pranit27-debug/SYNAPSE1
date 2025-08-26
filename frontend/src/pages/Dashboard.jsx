import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Tasks',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: CheckSquare,
      color: 'primary'
    },
    {
      title: 'Completed',
      value: '18',
      change: '+8%',
      changeType: 'positive',
      icon: Target,
      color: 'success'
    },
    {
      title: 'In Progress',
      value: '6',
      change: '-2%',
      changeType: 'negative',
      icon: Clock,
      color: 'warning'
    },
    {
      title: 'Notes',
      value: '32',
      change: '+15%',
      changeType: 'positive',
      icon: FileText,
      color: 'accent'
    }
  ];

  const recentTasks = [
    { id: 1, title: 'Complete project setup', status: 'completed', priority: 'high', dueDate: '2024-01-15' },
    { id: 2, title: 'Review code quality', status: 'in-progress', priority: 'medium', dueDate: '2024-01-20' },
    { id: 3, title: 'Write documentation', status: 'todo', priority: 'medium', dueDate: '2024-01-25' },
    { id: 4, title: 'Test new features', status: 'todo', priority: 'low', dueDate: '2024-01-30' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'in-progress': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'todo': return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-100 dark:bg-error-900/20';
      case 'medium': return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'low': return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      default: return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    }
  };

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
            Dashboard
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity className="w-4 h-4" />
          <span>View Reports</span>
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="hover:shadow-medium transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg',
                    stat.color === 'primary' && 'bg-primary-100 dark:bg-primary-900/20 text-primary-600',
                    stat.color === 'success' && 'bg-success-100 dark:bg-success-900/20 text-success-600',
                    stat.color === 'warning' && 'bg-warning-100 dark:bg-warning-900/20 text-warning-600',
                    stat.color === 'accent' && 'bg-accent-100 dark:bg-accent-900/20 text-accent-600'
                  )}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex items-center mt-4">
                  <span className={cn(
                    'text-sm font-medium',
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                  )}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <motion.div
          className="lg:col-span-2"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Productivity Overview
                </h3>
                <select className="text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg px-3 py-1 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                  <p className="text-secondary-500 dark:text-secondary-400">
                    Chart component will be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Recent Tasks
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getStatusColor(task.status)
                          )}>
                            {task.status}
                          </span>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                        {task.dueDate}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Tasks →
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: CheckSquare, label: 'New Task', color: 'primary' },
                { icon: FileText, label: 'New Note', color: 'accent' },
                { icon: Calendar, label: 'Schedule', color: 'success' },
                { icon: TrendingUp, label: 'Analytics', color: 'warning' }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  className={cn(
                    'p-4 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600',
                    'hover:border-primary-400 dark:hover:border-primary-500 transition-colors',
                    'flex flex-col items-center space-y-2'
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    action.color === 'primary' && 'bg-primary-100 dark:bg-primary-900/20 text-primary-600',
                    action.color === 'accent' && 'bg-accent-100 dark:bg-accent-900/20 text-accent-600',
                    action.color === 'success' && 'bg-success-100 dark:bg-success-900/20 text-success-600',
                    action.color === 'warning' && 'bg-warning-100 dark:bg-warning-900/20 text-warning-600'
                  )}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
