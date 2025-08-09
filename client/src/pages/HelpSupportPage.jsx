import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HelpSupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I book a meal?",
      answer: "To book a meal, go to the Menu page, select your preferred meal type (breakfast, lunch, or dinner), choose the date, and click 'Book Meal'. You can also use the Quick Actions on the dashboard."
    },
    {
      id: 2,
      question: "How do I add money to my wallet?",
      answer: "Navigate to the Wallet section, click 'Recharge Wallet', enter the amount, and complete the payment using UPI or other available payment methods."
    },
    {
      id: 3,
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel bookings up to 2 hours before the meal time. Go to 'My Bookings' and click the cancel button next to your booking."
    },
    {
      id: 4,
      question: "How do I view my meal QR code?",
      answer: "After booking a meal, you can view your QR code in the 'My Bookings' section or use the 'View QR Code' quick action on the dashboard."
    },
    {
      id: 5,
      question: "What if I forget to book a meal?",
      answer: "You can book meals up to 2 hours before the meal time. If you miss the deadline, you may need to contact the mess administration for assistance."
    },
    {
      id: 6,
      question: "How do I update my profile?",
      answer: "Go to your Profile page, click 'Edit Profile', make your changes, and save. You can also update your avatar by clicking the camera icon."
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      description: "Learn the basics of using MessMate",
      icon: BookOpenIcon,
      steps: [
        "Create your account and complete profile setup",
        "Add money to your wallet for meal bookings",
        "Browse the daily menu and book your meals",
        "Use your QR code to collect meals from the mess"
      ]
    },
    {
      title: "Booking Meals",
      description: "Step-by-step guide to booking meals",
      icon: CheckCircleIcon,
      steps: [
        "Navigate to the Menu page",
        "Select your preferred meal type",
        "Choose the date and time",
        "Confirm your booking and payment"
      ]
    },
    {
      title: "Wallet Management",
      description: "How to manage your wallet and payments",
      icon: InformationCircleIcon,
      steps: [
        "Check your current balance",
        "Recharge your wallet with required amount",
        "View transaction history",
        "Request refunds if needed"
      ]
    }
  ];

  const contactInfo = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: EnvelopeIcon,
      value: "support@messmate.com",
      action: "mailto:support@messmate.com"
    },
    {
      title: "Phone Support",
      description: "Call us for immediate assistance",
      icon: PhoneIcon,
      value: "+91 98765 43210",
      action: "tel:+919876543210"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: ChatBubbleLeftRightIcon,
      value: "Available 9 AM - 6 PM",
      action: "/contact"
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const tabs = [
    { id: 'faq', name: 'FAQ', icon: QuestionMarkCircleIcon },
    { id: 'guides', name: 'Guides', icon: BookOpenIcon },
    { id: 'contact', name: 'Contact', icon: PhoneIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600">Find answers to your questions and get the help you need</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Response</p>
                  <p className="text-lg font-bold text-gray-900">Within 2 hours</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <PhoneIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Hours</p>
                  <p className="text-lg font-bold text-gray-900">9 AM - 6 PM</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Live Chat</p>
                  <p className="text-lg font-bold text-gray-900">Available</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-3 bg-white border-t border-gray-200"
                      >
                        <p className="text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map((guide, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-center mb-4">
                        <guide.icon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                        </div>
                      </div>
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contactInfo.map((contact, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center"
                    >
                      <contact.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
                      <a
                        href={contact.action}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {contact.value}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Emergency Contact */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-red-900">Emergency Contact</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    For urgent issues or complaints, please contact us immediately:
                  </p>
                  <div className="flex items-center space-x-4">
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Emergency: +91 98765 43210
                    </a>
                    <Link
                      to="/contact"
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Contact Form
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpSupportPage; 