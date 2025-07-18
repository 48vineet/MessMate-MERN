// hooks/useModal.js
import { useState, useCallback, useRef, useEffect } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const previousFocusRef = useRef(null);

  // Open modal
  const openModal = useCallback((modalData = null) => {
    // Store current focused element
    previousFocusRef.current = document.activeElement;
    
    setData(modalData);
    setIsOpen(true);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setLoading(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    
    // Restore focus to previous element
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  // Toggle modal
  const toggleModal = useCallback((modalData = null) => {
    if (isOpen) {
      closeModal();
    } else {
      openModal(modalData);
    }
  }, [isOpen, openModal, closeModal]);

  // Update modal data
  const updateData = useCallback((newData) => {
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  // Set loading state
  const setModalLoading = useCallback((loadingState) => {
    setLoading(loadingState);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    isOpen,
    data,
    loading,
    openModal,
    closeModal,
    toggleModal,
    updateData,
    setLoading: setModalLoading
  };
};

// Hook for managing multiple modals
export const useModals = () => {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalId, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { isOpen: true, data, loading: false }
    }));
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback((modalId) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { isOpen: false, data: null, loading: false }
    }));
    
    // Check if any modals are still open
    const hasOpenModals = Object.values(modals).some(modal => modal?.isOpen);
    if (!hasOpenModals) {
      document.body.style.overflow = 'unset';
    }
  }, [modals]);

  const updateModalData = useCallback((modalId, newData) => {
    setModals(prev => ({
      ...prev,
      [modalId]: prev[modalId] ? {
        ...prev[modalId],
        data: { ...prev[modalId].data, ...newData }
      } : { isOpen: false, data: newData, loading: false }
    }));
  }, []);

  const setModalLoading = useCallback((modalId, loading) => {
    setModals(prev => ({
      ...prev,
      [modalId]: prev[modalId] ? {
        ...prev[modalId],
        loading
      } : { isOpen: false, data: null, loading }
    }));
  }, []);

  const getModal = useCallback((modalId) => {
    return modals[modalId] || { isOpen: false, data: null, loading: false };
  }, [modals]);

  const closeAllModals = useCallback(() => {
    setModals({});
    document.body.style.overflow = 'unset';
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    updateModalData,
    setModalLoading,
    getModal,
    closeAllModals
  };
};

export default useModal;
