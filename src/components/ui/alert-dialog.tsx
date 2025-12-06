import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, buttonColor } = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-up">
        {/* Header with Icon */}
        <div className={`${bgColor} ${borderColor} border-b px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`${iconColor} bg-white rounded-full p-2 shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold ${titleColor}`}>
              {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information')}
            </h3>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-6">
          <p className="text-slate-700 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer with Button */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className={`${buttonColor} text-white px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-sm`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
