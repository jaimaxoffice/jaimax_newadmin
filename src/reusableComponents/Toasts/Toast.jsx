import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-[#b9fd5c]" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  warning: <AlertTriangle className="text-[#ff8533]" size={20} />,
  info: <Info className="text-blue-400" size={20} />,
  loading: <Loader2 className="text-[#b9fd5c] animate-spin" size={20} />
};

const progressColors = {
  success: 'bg-[#b9fd5c]',
  error: 'bg-red-500',
  warning: 'bg-[#ff8533]',
  info: 'bg-blue-400',
  loading: 'bg-[#b9fd5c]'
};

export const ToastItem = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast.duration === Infinity) return;

    const startTime = Date.now();
    const duration = toast.duration;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [toast.duration]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  // Handle manual dismiss from parent update
  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.type, toast.duration, toast.id, onDismiss]);

  return (
    <div 
      className={`relative flex w-full max-w-sm overflow-hidden rounded-2xl border border-[#2a2c2f] bg-[#282f35] shadow-2xl shadow-black/50 transform transition-all duration-300 ${
        exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4'
      }`}
    >
      {/* Left border accent */}
      <div className={`w-1 ${progressColors[toast.type]}`} />
      
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-semibold text-white leading-5">
              {toast.message}
            </h4>
            {toast.description && (
              <p className="mt-1 text-xs text-[#8a8d93] leading-4">
                {toast.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 p-1.5 rounded-lg text-[#8a8d93] hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      {toast.duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2a2c2f]">
          <div 
            className={`h-full ${progressColors[toast.type]} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer = ({ toasts, position, onDismiss }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={`fixed z-50 flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}>
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
};