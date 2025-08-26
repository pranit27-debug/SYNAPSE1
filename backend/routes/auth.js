const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const router = express.Router();

// Login user with enhanced security
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required'),
  body('mfaCode').optional().isLength({ min: 6, max: 6 }).withMessage('MFA code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password, mfaCode } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password +mfaSecret +mfaBackupCodes');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts. Please try again later.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // If MFA is enabled, require MFA code
    if (user.mfaEnabled && !mfaCode) {
      return res.status(400).json({
        success: false,
        message: 'MFA code required',
        requiresMFA: true
      });
    }

    // Verify MFA if enabled
    if (user.mfaEnabled && mfaCode) {
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'hex',
        token: mfaCode,
        window: 2 // Allow 2 time steps (60 seconds) for clock skew
      });

      if (!verified) {
        // Check backup codes
        const backupCodeIndex = user.mfaBackupCodes.findIndex(code => 
          code.code === mfaCode && !code.used
        );

        if (backupCodeIndex === -1) {
          return res.status(401).json({
            success: false,
            message: 'Invalid MFA code'
          });
        }

        // Mark backup code as used
        user.mfaBackupCodes[backupCodeIndex].used = true;
        await user.save();
      }
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        mfaVerified: user.mfaEnabled ? true : false
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove sensitive data from response
    user.password = undefined;
    user.mfaSecret = undefined;

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Setup MFA
router.post('/setup-mfa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('+mfaSecret');
    
    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled'
      });
    }

    // Generate MFA secret and backup codes
    const secret = user.generateMFASecret();
    const backupCodes = user.generateBackupCodes();
    
    // Generate QR code for authenticator apps
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: user.email,
      issuer: process.env.MFA_ISSUER || 'Synapse',
      algorithm: 'sha1',
      digits: 6,
      period: 30
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    
    await user.save();

    res.json({
      success: true,
      mfaSecret: secret,
      qrCode: qrCodeDataUrl,
      backupCodes: backupCodes.map(code => ({ code: code.code, used: code.used })),
      message: 'MFA setup successful. Scan the QR code with your authenticator app and save your backup codes securely.'
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enable MFA
router.post('/enable-mfa', auth, [
  body('mfaCode').isLength({ min: 6, max: 6 }).withMessage('MFA code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { mfaCode } = req.body;
    const user = await User.findById(req.user.userId).select('+mfaSecret');

    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please setup MFA first'
      });
    }

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'hex',
      token: mfaCode,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA code'
      });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    console.error('Enable MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Disable MFA
router.post('/disable-mfa', auth, [
  body('mfaCode').isLength({ min: 6, max: 6 }).withMessage('MFA code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { mfaCode } = req.body;
    const user = await User.findById(req.user.userId).select('+mfaSecret');

    if (!user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled'
      });
    }

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'hex',
      token: mfaCode,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA code'
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = [];
    await user.save();

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Generate new token
    const token = jwt.sign(
      { 
        userId: user._id,
        mfaVerified: user.mfaEnabled ? true : false
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Logout (optional - client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update user preferences
router.put('/preferences', auth, [
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('language').optional().isLength({ min: 2, max: 5 }).withMessage('Invalid language code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { theme, notifications, language } = req.body;
    const user = await User.findById(req.user.userId);

    if (theme !== undefined) user.preferences.theme = theme;
    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (language !== undefined) user.preferences.language = language;

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
