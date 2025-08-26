import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  focus: { scale: 1.02, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' },
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

const variantStyles = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-soft hover:shadow-medium',
  secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 border border-secondary-200',
  outline: 'bg-transparent hover:bg-secondary-50 text-secondary-700 border-2 border-secondary-300 hover:border-secondary-400',
  ghost: 'bg-transparent hover:bg-secondary-100 text-secondary-700',
  danger: 'bg-error-600 hover:bg-error-700 text-white shadow-soft hover:shadow-medium',
  success: 'bg-success-600 hover:bg-success-700 text-white shadow-soft hover:shadow-medium',
  warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-soft hover:shadow-medium',
};

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    sizeVariants[size],
    variantStyles[variant],
    fullWidth && 'w-full',
    className
  );

  const iconClasses = cn(
    'transition-transform duration-200',
    iconPosition === 'left' ? 'mr-2' : 'ml-2',
    loading && 'animate-spin'
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className={iconClasses}>
          {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={iconClasses}>
          {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : icon}
        </span>
      )}
    </>
  );

  if (disabled || loading) {
    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={true}
        type={type}
        {...props}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      whileFocus="focus"
      onClick={onClick}
      type={type}
      {...props}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';
