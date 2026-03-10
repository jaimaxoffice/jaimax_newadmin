import React from 'react';
import { X } from 'lucide-react';
import { decryptMessage } from '../encryptmsg';

const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

const ErrorDetailModal = ({ errorMessage, retryMessage, formatTime, onClose }) => {
    const msgText = errorMessage.msgBody?.message;

    let displayText;
    if (typeof msgText === 'object' && msgText?.cipherText) {
        try { displayText = decryptMessage(msgText, SECRET_KEY); }
        catch { displayText = "[Encrypted message]"; }
    } else if (msgText) {
        displayText = String(msgText);
    } else {
        displayText = "Media message";
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#202c33] rounded-lg max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-[#2a3942]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Message Not Sent</h3>
                            <p className="text-xs text-gray-400">{formatTime(errorMessage.timestamp)}</p>
                        </div>
                    </div>
                </div>

                {/* Message preview */}
                <div className="p-4 bg-[#0b141a] border-b border-[#2a3942]">
                    <p className="text-xs text-gray-400 mb-1">Your message:</p>
                    <p className="text-sm text-gray-200 line-clamp-2">{displayText}</p>
                </div>

                {/* Error reason */}
                <div className="p-4">
                    <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Error reason:</p>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-sm text-red-400">{errorMessage.error || "Unknown error occurred"}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { onClose(); retryMessage?.(errorMessage); }}
                            className="flex-1 bg-[#00a884] hover:bg-[#008069] text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                        <button onClick={onClose} className="flex-1 bg-[#0b141a] hover:bg-[#1a2730] text-white py-2.5 rounded-lg font-medium text-sm transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorDetailModal;