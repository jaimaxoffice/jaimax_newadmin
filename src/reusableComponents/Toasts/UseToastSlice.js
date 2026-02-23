import { useCallback } from 'react';
import { ToastProvider } from './ToastContext';

export const useToast = () => {
  const showSuccess = useCallback((message, description, options) => {
    toast.success(message, description, options);
  }, []);

  const showError = useCallback((message, description, options) => {
    toast.error(message, description, options);
  }, []);

  const showWarning = useCallback((message, description, options) => {
    toast.warning(message, description, options);
  }, []);

  const showInfo = useCallback((message, description, options) => {
    toast.info(message, description, options);
  }, []);

  const showLoading = useCallback((message, description, options) => {
    return toast.loading(message, description, options);
  }, []);

  const handlePromise = useCallback((promise, messages, options) => {
    return toast.promise(promise, messages, options);
  }, []);

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    promise: handlePromise,
    dismiss: toast.dismiss,
    update: toast.update,
  };
};