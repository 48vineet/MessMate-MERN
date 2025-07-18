// hooks/index.js - Barrel export file
export { default as useAuth } from './useAuth';
export { default as useApi } from './useApi';
export { default as useSocket } from './useSocket';
export { default as useBooking } from './useBooking';
export { default as useMenu } from './useMenu';
export { default as usePayment } from './usePayment';
export { default as useModal, useModals } from './useModal';
export { default as useToast, toast, setGlobalToastHandler } from './useToast';

// Re-export for convenience
export {
  useAuth,
  useApi,
  useSocket,
  useBooking,
  useMenu,
  usePayment,
  useModal,
  useModals,
  useToast
};
