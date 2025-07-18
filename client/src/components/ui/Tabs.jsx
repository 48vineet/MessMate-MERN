// src/components/ui/Tabs.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

const Tabs = ({ children, defaultTab = 0, className = '', onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <div className={className}>
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {children.map((child, index) => (
          <motion.button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`
              relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${activeTab === index 
                ? 'text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{child.props.label}</span>
          </motion.button>
        ))}
      </div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {children[activeTab]}
      </motion.div>
    </div>
  );
};

export const TabPanel = ({ children, label }) => {
  return <div>{children}</div>;
};

export default Tabs;
