// src/components/ui/Tabs.jsx
import { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';

// Tabs Context
const TabsContext = createContext();

const Tabs = ({ 
  children, 
  defaultValue, 
  value, 
  onChange,
  orientation = 'horizontal',
  variant = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : activeTab;
  
  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onChange && onChange(newValue);
  };

  const getTabsClasses = () => {
    const baseClasses = orientation === 'vertical' 
      ? 'flex flex-col' 
      : 'flex flex-col';
    
    return `${baseClasses} ${className}`;
  };

  return (
    <TabsContext.Provider value={{
      activeTab: currentValue,
      setActiveTab: handleTabChange,
      orientation,
      variant
    }}>
      <div className={getTabsClasses()}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tab List Component
const TabsList = ({ children, className = '' }) => {
  const { orientation, variant } = useContext(TabsContext);
  
  const getListClasses = () => {
    let baseClasses = orientation === 'vertical' 
      ? 'flex flex-col space-y-1' 
      : 'flex space-x-1';
    
    switch (variant) {
      case 'pills':
        baseClasses += ' bg-gray-100 p-1 rounded-lg';
        break;
      case 'underline':
        baseClasses += ' border-b border-gray-200';
        break;
      case 'cards':
        baseClasses += ' bg-gray-50 p-2 rounded-lg';
        break;
      default:
        baseClasses += ' border-b border-gray-200';
    }
    
    return `${baseClasses} ${className}`;
  };

  return (
    <div className={getListClasses()}>
      {children}
    </div>
  );
};

// Tab Trigger Component
const TabsTrigger = ({ 
  children, 
  value, 
  disabled = false,
  className = ''
}) => {
  const { activeTab, setActiveTab, variant } = useContext(TabsContext);
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const getTriggerClasses = () => {
    let baseClasses = 'relative px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    if (disabled) {
      baseClasses += ' opacity-50 cursor-not-allowed';
    } else {
      baseClasses += ' cursor-pointer';
    }

    switch (variant) {
      case 'pills':
        baseClasses += ' rounded-md';
        if (isActive) {
          baseClasses += ' bg-white text-gray-900 shadow-sm';
        } else {
          baseClasses += ' text-gray-600 hover:text-gray-900 hover:bg-white/50';
        }
        break;
      case 'underline':
        baseClasses += ' border-b-2 border-transparent';
        if (isActive) {
          baseClasses += ' text-blue-600 border-blue-600';
        } else {
          baseClasses += ' text-gray-600 hover:text-gray-900 hover:border-gray-300';
        }
        break;
      case 'cards':
        baseClasses += ' rounded-lg';
        if (isActive) {
          baseClasses += ' bg-white text-gray-900 shadow-sm';
        } else {
          baseClasses += ' text-gray-600 hover:text-gray-900 hover:bg-gray-100';
        }
        break;
      default:
        baseClasses += ' border-b-2 border-transparent';
        if (isActive) {
          baseClasses += ' text-blue-600 border-blue-600';
        } else {
          baseClasses += ' text-gray-600 hover:text-gray-900 hover:border-gray-300';
        }
    }
    
    return `${baseClasses} ${className}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={getTriggerClasses()}
      role="tab"
      aria-selected={isActive}
    >
      {children}
      {isActive && variant === 'underline' && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
};

// Tab Content Component  
const TabsContent = ({ 
  children, 
  value,
  className = ''
}) => {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`mt-4 focus:outline-none ${className}`}
      role="tabpanel"
    >
      {children}
    </motion.div>
  );
};

// Export all components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
