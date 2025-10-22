import { useState } from 'react';

const PaymentRequiredModal = ({ isOpen, onClose, fee, type }) => {
  const [loading, setLoading] = useState(false);

  const handleProceedToPayment = () => {
    setLoading(true);
    // Close this modal and let the parent component handle Stripe payment
    onClose();
    // The parent component should show StripePaymentModal
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Payment Required
          </h3>
          
          <p className="text-gray-600 mb-4">
            To join as {type === 'audience' ? 'audience' : 'player'}, you need to pay the registration fee.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-gray-900">
              ₹{fee}
            </div>
            <div className="text-sm text-gray-500">
              Fee for {type === 'audience' ? 'Audience' : 'Player'} registration
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">
                Secure payment processing available!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Powered by Stripe - Safe and secure payment processing
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequiredModal;
