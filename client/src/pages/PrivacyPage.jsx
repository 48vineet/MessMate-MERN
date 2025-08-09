// src/pages/PrivacyPage.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const PrivacyPage = () => {
  const [privacyData, setPrivacyData] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      const response = await api.get('/public/privacy');
      setPrivacyData(response.data.privacy);
      setLastUpdated(response.data.lastUpdated);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      // Fallback privacy policy if API fails
      setPrivacyData({
        introduction: "At MessMate, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.",
        sections: [
          {
            title: "Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support."
          },
          {
            title: "How We Use Your Information",
            content: "We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you."
          }
        ]
      });
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-4"
          >
            <ShieldCheckIcon className="h-12 w-12 text-blue-200 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100"
          >
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </motion.p>
        </div>
      </div>

      {/* Privacy Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-0">
                {privacyData.introduction}
              </p>
            </div>

            {privacyData.sections?.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-700 leading-relaxed">
                  {section.content.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Data Protection Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-4 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Your Data is Protected</h3>
                  <p className="text-blue-800 mb-4">
                    We use industry-standard security measures to protect your personal information and ensure your privacy.
                  </p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• End-to-end encryption for sensitive data</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Compliance with data protection regulations</li>
                    <li>• No sharing of personal data with third parties without consent</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-6 bg-gray-50 rounded-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>Email: privacy@messmate.com</li>
                <li>Phone: +91 98765 43210</li>
                <li>Address: Tech Park, Bangalore, India</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
