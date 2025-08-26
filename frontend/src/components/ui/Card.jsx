import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1
  },
  hover: { 
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98 
  }
};

export const Card = React.forwardRef(({
  children,
  className,
  hover = true,
  clickable = false,
  onClick,
  delay = 0,
  ...props
}, ref) => {
  const baseClasses = cn(
    'bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700',
    'shadow-soft hover:shadow-medium transition-all duration-200',
    clickable && 'cursor-pointer',
    className
  );

  const MotionComponent = hover ? motion.div : motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={baseClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      whileTap={clickable ? "tap" : undefined}
      onClick={onClick}
      transition={{
        duration: 0.3,
        delay: delay * 0.1,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
});

export const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('px-6 py-4 border-b border-secondary-200 dark:border-secondary-700', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }) => (
  <div
    className={cn('px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('px-6 py-4 border-t border-secondary-200 dark:border-secondary-700', className)}
    {...props}
  >
    {children}
  </div>
);

Card.displayName = 'Card';
