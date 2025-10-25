// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter (CORRECTED METHOD NAME) 
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user);
  
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode)
     .cookie('token', token, options)
     .json({
       success: true,
       message,
       token,
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         studentId: user.studentId,
         avatar: user.avatar,
         wallet: user.wallet,
         isVerified: user.isVerified,
         preferences: user.preferences
       }
     });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId: role === 'student' ? studentId : undefined,
      phone
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to MessMate! 🍽️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to MessMate!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Smart Mess Management System</p>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}! 👋</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Welcome to MessMate! Your account has been successfully created. You can now:
              </p>
              <ul style="color: #666; line-height: 1.8; font-size: 15px;">
                <li>🍽️ Browse daily menu items</li>
                <li>📅 Book your meals in advance</li>
                <li>💳 Manage your wallet and payments</li>
                <li>⭐ Rate and review meals</li>
                <li>📊 Track your dining statistics</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}/login" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Login to MessMate
                </a>
              </div>
              <p style="color: #888; font-size: 14px; text-align: center;">
                Happy dining! 🎉<br>
                The MessMate Team
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.log('Welcome email failed to send:', emailError);
    }

    sendTokenResponse(user, 201, res, 'User registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wallet.transactions', '-__v');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        phone: user.phone,
        avatar: user.avatar,
        wallet: user.wallet,
        isVerified: user.isVerified,
        preferences: user.preferences,
        stats: user.stats,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set resetPasswordToken
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'MessMate Password Reset Request 🔐',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello ${user.name}! 👋</h2>
              <p style="color: #666; line-height: 1.6;">
                You have requested a password reset for your MessMate account. 
                Click the button below to reset your password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #888; font-size: 14px;">
                This link will expire in 10 minutes.<br>
                If you didn't request this, please ignore this email.
              </p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Or copy and paste this URL in your browser:<br>
                <span style="color: #007bff; word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });

    } catch (emailError) {
      console.log('Password reset email failed:', emailError);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating password'
    });
  }
};

// @desc    Admin create user
// @route   POST /api/auth/admin/create-user
// @access  Private/Admin
exports.adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, studentId, phone, hostel } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId: role === 'student' ? studentId : undefined,
      phone,
      hostel,
      isActive: true,
      isVerified: true // Admin-created users are automatically verified
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to MessMate! 🍽️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to MessMate!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Smart Mess Management System</p>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}! 👋</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Welcome to MessMate! Your account has been created by an administrator. You can now:
              </p>
              <ul style="color: #666; line-height: 1.8; font-size: 15px;">
                <li>🍽️ Browse daily menu items</li>
                <li>📅 Book your meals in advance</li>
                <li>💳 Manage your wallet and payments</li>
                <li>⭐ Rate and review meals</li>
                <li>📊 Track your dining statistics</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}/login" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Login to MessMate
                </a>
              </div>
              <p style="color: #888; font-size: 14px; text-align: center;">
                Happy dining! 🎉<br>
                The MessMate Team
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.log('Welcome email failed to send:', emailError);
    }

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload avatar
// @route   PUT /api/auth/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      try {
        const { deleteFromCloudinary } = require('../middleware/upload');
        await deleteFromCloudinary(user.avatar.public_id);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Update user avatar
    user.avatar = {
      public_id: req.cloudinaryResult.public_id,
      url: req.cloudinaryResult.url
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading avatar'
    });
  }
};

module.exports = exports;
