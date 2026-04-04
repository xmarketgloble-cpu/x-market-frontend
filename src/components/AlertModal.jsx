// src/components/AlertModal.jsx
import React from 'react';

function AlertModal({ isOpen, message, type = 'error', onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all animate-in zoom-in-95">
        
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
          }`}>
            {type === 'error' ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Message */}
          <div>
            <h3 className="text-white text-lg font-black tracking-tight mb-1">
              {type === 'error' ? 'Action Failed' : 'Success'}
            </h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all mt-2 ${
              type === 'error' 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' 
              : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20'
            }`}
          >
            Acknowledge
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default AlertModal;