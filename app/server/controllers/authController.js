import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  res.cookie('token', token, cookieOptions);
};

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password, fullName: fullName || username });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // ✅ FIX: Wrap sendEmail in try/catch so registration doesn't crash if SMTP is not configured
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - Instagram Clone',
        html: `<p>Hi ${user.username},</p><p>Please click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
      });
    } catch (emailError) {
      console.warn('Email sending failed (SMTP may not be configured):', emailError.message);
      // Registration continues even if email fails
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastActive = new Date();
      await req.user.save();
    }
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        coverImage: user.coverImage,
        bio: user.bio,
        website: user.website,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        isOnline: user.isOnline,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
        savedPosts: user.savedPosts,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    // ✅ FIX: Wrap sendEmail in try/catch
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Password Reset - Instagram Clone',
        html: `<p>Hi ${user.username},</p><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
      });
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (emailError) {
      console.warn('Email sending failed:', emailError.message);
      res.status(500).json({ success: false, message: 'Failed to send reset email. Please check your SMTP configuration.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    setTokenCookie(res, jwtToken);

    res.json({ success: true, token: jwtToken, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // ✅ FIX: Wrap sendEmail in try/catch
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - Instagram Clone',
        html: `<p>Hi ${user.username},</p><p>Please click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
      });
      res.json({ success: true, message: 'Verification email sent' });
    } catch (emailError) {
      console.warn('Email sending failed:', emailError.message);
      res.status(500).json({ success: false, message: 'Failed to send verification email. Please check your SMTP configuration.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};