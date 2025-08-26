import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const sizeVariants = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    }
  }
};

const dotVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      stagger: 0.2,
    }
  }
};

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'spinner',
  className,
  text,
  ...props 
}) => {
  const sizeClasses = sizeVariants[size];

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center space-y-3', className)} {...props}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                'bg-primary-600 rounded-full',
                size === 'sm' && 'w-2 h-2',
                size === 'md' && 'w-3 h-3',
                size === 'lg' && 'w-4 h-4',
                size === 'xl' && 'w-5 h-5',
                size === '2xl' && 'w-6 h-6',
              )}
              variants={dotVariants}
              animate="animate"
            />
          ))}
        </div>
        {text && (
          <motion.p
            className="text-secondary-600 dark:text-secondary-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center space-y-3', className)} {...props}>
        <motion.div
          className={cn(
            'bg-primary-600 rounded-full',
            sizeClasses
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        {text && (
          <motion.p
            className="text-secondary-600 dark:text-secondary-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn('flex flex-col items-center space-y-3', className)} {...props}>
      <motion.div
        className={cn(
          'border-2 border-secondary-200 border-t-primary-600 rounded-full',
          sizeClasses
        )}
        variants={spinnerVariants}
        animate="animate"
      />
      {text && (
        <motion.p
          className="text-secondary-600 dark:text-secondary-400 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ 
  children, 
  loading = false, 
  text = 'Loading...',
  className,
  ...props 
}) => {
  if (!loading) return children;

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <motion.div
        className="absolute inset-0 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <LoadingSpinner size="lg" text={text} />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
