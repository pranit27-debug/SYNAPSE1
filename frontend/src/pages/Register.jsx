import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { cn } from '../utils/cn';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Very Weak', color: 'text-error-600' };
      case 1: return { text: 'Weak', color: 'text-error-600' };
      case 2: return { text: 'Fair', color: 'text-warning-600' };
      case 3: return { text: 'Good', color: 'text-warning-600' };
      case 4: return { text: 'Strong', color: 'text-success-600' };
      case 5: return { text: 'Very Strong', color: 'text-success-600' };
      default: return { text: 'Very Weak', color: 'text-error-600' };
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-error-500';
      case 1: return 'bg-error-500';
      case 2: return 'bg-warning-500';
      case 3: return 'bg-warning-500';
      case 4: return 'bg-success-500';
      case 5: return 'bg-success-500';
      default: return 'bg-error-500';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-glow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Join Synapse
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Create your account and start organizing your life
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="shadow-strong">
            <CardHeader className="text-center pb-2">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                Create Account
              </h2>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    type="text"
                    name="username"
                    label="Username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    icon={<User className="w-5 h-5" />}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Email Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={<Mail className="w-5 h-5" />}
                    disabled={isLoading}
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={<Lock className="w-5 h-5" />}
                    disabled={isLoading}
                    iconPosition="right"
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getPasswordStrengthText().color}`}>
                          {getPasswordStrengthText().text}
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="grid grid-cols-2 gap-1 text-xs text-secondary-500 dark:text-secondary-400">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={cn(
                            'w-3 h-3',
                            formData.password.length >= 8 ? 'text-success-500' : 'text-secondary-400'
                          )} />
                          <span>8+ characters</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={cn(
                            'w-3 h-3',
                            /[a-z]/.test(formData.password) ? 'text-success-500' : 'text-secondary-400'
                          )} />
                          <span>Lowercase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={cn(
                            'w-3 h-3',
                            /[A-Z]/.test(formData.password) ? 'text-success-500' : 'text-secondary-400'
                          )} />
                          <span>Uppercase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={cn(
                            'w-3 h-3',
                            /[0-9]/.test(formData.password) ? 'text-success-500' : 'text-secondary-400'
                          )} />
                          <span>Number</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={<Lock className="w-5 h-5" />}
                    disabled={isLoading}
                    iconPosition="right"
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                  />
                </motion.div>

                {/* Auth Error */}
                {authError && (
                  <motion.div
                    className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-error-600 dark:text-error-400">
                      {authError}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                className="relative"
                variants={itemVariants}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-secondary-800 text-secondary-500">
                    Already have an account?
                  </span>
                </div>
              </motion.div>

              {/* Login Link */}
              <motion.div variants={itemVariants}>
                <Link
                  to="/login"
                  className="block w-full text-center py-3 px-4 border-2 border-secondary-300 dark:border-secondary-600 rounded-lg text-secondary-700 dark:text-secondary-300 font-medium hover:border-secondary-400 dark:hover:border-secondary-500 hover:text-secondary-900 dark:hover:text-white transition-all duration-200"
                >
                  Sign In
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
