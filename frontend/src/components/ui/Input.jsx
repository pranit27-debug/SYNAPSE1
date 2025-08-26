import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const inputVariants = {
  initial: { scale: 1 },
  focus: { scale: 1.01 },
  error: { scale: 1.01, x: [-2, 2, -2, 2, 0] },
};

export const Input = forwardRef(({
  className,
  type = 'text',
  label,
  error,
  success,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}, ref) => {
  const hasError = !!error;
  const hasSuccess = !!success;

  const baseClasses = cn(
    'block w-full px-4 py-3 text-base transition-all duration-200',
    'bg-white dark:bg-secondary-800 border-2 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder-secondary-400 dark:placeholder-secondary-500',
    fullWidth && 'w-full',
    className
  );

  const stateClasses = cn(
    // Default state
    'border-secondary-300 dark:border-secondary-600',
    'hover:border-secondary-400 dark:hover:border-secondary-500',
    'focus:border-primary-500 dark:focus:border-primary-400',
    
    // Error state
    hasError && 'border-error-500 dark:border-error-400',
    hasError && 'focus:border-error-500 dark:focus:border-error-400',
    hasError && 'focus:ring-error-500 dark:focus:ring-error-400',
    
    // Success state
    hasSuccess && 'border-success-500 dark:border-success-400',
    hasSuccess && 'focus:border-success-500 dark:focus:border-success-400',
    hasSuccess && 'focus:ring-success-500 dark:focus:ring-success-400',
  );

  const iconClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500',
    iconPosition === 'left' ? 'left-3' : 'right-3',
    'transition-colors duration-200'
  );

  const inputWrapperClasses = cn(
    'relative',
    icon && iconPosition === 'left' && 'pl-12',
    icon && iconPosition === 'right' && 'pr-12'
  );

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <motion.label
          className={cn(
            'block text-sm font-medium text-secondary-700 dark:text-secondary-300',
            hasError && 'text-error-600 dark:text-error-400',
            hasSuccess && 'text-success-600 dark:text-success-400'
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className={inputWrapperClasses}>
        {icon && iconPosition === 'left' && (
          <span className={iconClasses}>
            {icon}
          </span>
        )}
        
        <motion.input
          ref={ref}
          type={type}
          className={cn(baseClasses, stateClasses)}
          variants={inputVariants}
          initial="initial"
          whileFocus="focus"
          animate={hasError ? "error" : "initial"}
          disabled={disabled || loading}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className={iconClasses}>
            {icon}
          </span>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          className="text-sm text-error-600 dark:text-error-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {success && (
        <motion.p
          className="text-sm text-success-600 dark:text-success-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {success}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
