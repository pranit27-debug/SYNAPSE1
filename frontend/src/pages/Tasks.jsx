import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Tasks = () => {
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
            Tasks
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage and organize your tasks efficiently
          </p>
        </div>
        
        <Button variant="primary" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </motion.div>

      {/* Tasks Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <CheckSquare className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                Tasks Management
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                This page will contain the complete task management system with Kanban board, 
                task creation, editing, and advanced features.
              </p>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Tasks;
