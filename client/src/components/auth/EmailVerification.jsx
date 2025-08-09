// src/components/auth/EmailVerification.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, failed
  const [userEmail, setUserEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('failed');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        setVerificationStatus('success');
        setUserEmail(response.data.email);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('failed');
        toast.error('Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('failed');
      setUserEmail(error.response?.data?.email || '');
      toast.error(error.response?.data?.message || 'Email verification failed');
    }
  };

  const resendVerification = async () => {
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }

    setResendLoading(true);
    
    try {
      await api.post('/auth/resend-verification', { email: userEmail });
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Verifying state
  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 flex items-center justify-center px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
          <p className="text-gray-600 mb-2">
            Welcome to MessMate! Your email address has been verified.
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mb-6">
              Verified: <strong>{userEmail}</strong>
            </p>
          )}
          
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
            >
              <span>Continue to Login</span>
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <p className="text-xs text-gray-500">
              You can now sign in with your credentials
            </p>
            
            <p className="text-xs text-green-600 font-medium">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
        <p className="text-gray-600 mb-6">
          The email verification link is invalid or has expired. Please request a new verification email.
        </p>
        
        <div className="space-y-4">
          {userEmail ? (
            <button
              onClick={resendVerification}
              disabled={resendLoading}
              className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
                resendLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } transition-all`}
            >
              {resendLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
          ) : (
            <Link
              to="/register"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Register New Account
            </Link>
          )}
          
          <Link
            to="/login"
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
          >
            Back to Login
          </Link>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
            <ul className="text-xs text-blue-700 space-y-1 text-left">
              <li>• Check your spam or junk folder</li>
              <li>• Verification links expire after 24 hours</li>
              <li>• Make sure you're using the latest email</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
