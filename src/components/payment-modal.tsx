'use client';

import React from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { QrCode, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  consultationId: string;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onPaymentComplete, consultationId }) => {
  const [isPaying, setIsPaying] = React.useState(false);
  const [paymentComplete, setPaymentComplete] = React.useState(false);

  const handleSimulatePayment = async () => {
    setIsPaying(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPaymentComplete(true);
    
    // Wait a bit to show success message
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onPaymentComplete();
    setIsPaying(false);
    setPaymentComplete(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Consultation Payment" maxWidth="max-w-2xl">
      <div className="p-6 space-y-6">
        {!paymentComplete ? (
          <>
            {/* QR Code Display */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-lg">
                <Image
                  src="/MedAssist-qrph-standee.png"
                  alt="Payment QR Code"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-slate-700 font-medium">Scan QR code to pay</p>
                <p className="text-slate-500 text-sm">Consultation Fee: PHP 500.00</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">How to pay</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Scan the QR code with any payment app</li>
                    <li>Confirm payment of PHP 500.00</li>
                    <li>Your consultation will be sent to our doctors</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Simulate Payment Button (for demo) */}
            <div className="border-t pt-4">
              <button
                onClick={handleSimulatePayment}
                disabled={isPaying}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  '🧪 Simulate Payment (Demo Only)'
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                Click this button to simulate a successful payment without actual money transfer
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
            <p className="text-slate-600 text-center">
              Your consultation has been sent to our doctors.<br />
              You will be contacted shortly.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
