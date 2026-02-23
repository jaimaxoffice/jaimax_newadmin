import React, { createContext, useContext, useCallback, useState } from 'react';
import { ToastContainer } from './Toast';

const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children, position = 'top-center' }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = ++toastId;
    const newToast = {
      id,
      message,
      description: options.description || '',
      type: options.type || 'info',
      duration: options.duration ?? 3000,
      position: options.position || position, // Allow per-toast position override
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration !== Infinity) {
      setTimeout(() => removeToast(id), newToast.duration);
    }

    return id;
  }, [position, removeToast]);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const promise = useCallback(async (promiseFn, messages, options = {}) => {
    const id = addToast(messages.pending || 'Loading...', { 
      type: 'loading', 
      duration: Infinity,
      ...options 
    });

    try {
      const result = await promiseFn;
      updateToast(id, {
        type: 'success',
        message: messages.success || 'Success!',
        description: result?.message || '',
        duration: 3000
      });
      setTimeout(() => removeToast(id), 3000);
      return result;
    } catch (error) {
      updateToast(id, {
        type: 'error',
        message: messages.error || 'Error!',
        description: error?.message || '',
        duration: 5000
      });
      setTimeout(() => removeToast(id), 5000);
      throw error;
    }
  }, [addToast, updateToast, removeToast]);

  // ✅ FIXED: Handle second argument as options if it's an object
  const value = {
    success: (msg, descOrOpts = {}, opts) => {
      if (typeof descOrOpts === 'object') {
        return addToast(msg, { type: 'success', ...descOrOpts });
      }
      return addToast(msg, { type: 'success', description: descOrOpts, ...opts });
    },
    error: (msg, descOrOpts = {}, opts) => {
      if (typeof descOrOpts === 'object') {
        return addToast(msg, { type: 'error', ...descOrOpts });
      }
      return addToast(msg, { type: 'error', description: descOrOpts, ...opts });
    },
    warning: (msg, descOrOpts = {}, opts) => {
      if (typeof descOrOpts === 'object') {
        return addToast(msg, { type: 'warning', ...descOrOpts });
      }
      return addToast(msg, { type: 'warning', description: descOrOpts, ...opts });
    },
    info: (msg, descOrOpts = {}, opts) => {
      if (typeof descOrOpts === 'object') {
        return addToast(msg, { type: 'info', ...descOrOpts });
      }
      return addToast(msg, { type: 'info', description: descOrOpts, ...opts });
    },
    loading: (msg, descOrOpts = {}, opts) => {
      if (typeof descOrOpts === 'object') {
        return addToast(msg, { type: 'loading', duration: Infinity, ...descOrOpts });
      }
      return addToast(msg, { type: 'loading', description: descOrOpts, duration: Infinity, ...opts });
    },
    promise,
    dismiss: removeToast,
    update: updateToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};