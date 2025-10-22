import { useState } from 'react';
import api from '../../api/api';

const TicketValidator = ({ isOpen, onClose, eventId }) => {
  const [codeInput, setCodeInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateTicket = async () => {
    if (!codeInput.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to validate tickets');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // If organizer pasted QR JSON payload, use verify-ticket endpoint
      const trimmed = codeInput.trim();
      console.log('Validating ticket:', trimmed);
      
      let response;
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        // Treat as QR JSON payload
        console.log('Using QR JSON validation');
        response = await api.post(`/events/${eventId}/verify-ticket`, { qrData: trimmed });
      } else {
        // Treat as plain Ticket ID
        console.log('Using Ticket ID validation');
        response = await api.post(`/events/${eventId}/validate-ticket`, { ticketId: trimmed });
      }

      console.log('Validation response:', response.data);

      setResult({
        valid: true,
        ticket: response.data.ticket,
        user: response.data.user,
        message: response.data.message
      });
      setCodeInput(''); // Clear input after successful validation
    } catch (error) {
      console.error('Ticket validation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Invalid ticket';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to validate tickets';
      } else if (error.response?.status === 403) {
        errorMessage = 'Invalid or expired session. Please log in again';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setResult({
        valid: false,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCodeInput('');
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ticket Validator</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Ticket ID or paste QR JSON
              </label>
              <textarea
                rows={3}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder='TICKET_1234567890_ABC123  or  {"ticketId":"...","eventId":"...","userId":"..."}'
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                onKeyDown={(e) => (e.ctrlKey && e.key === 'Enter') && validateTicket()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: You can type the Ticket ID from the PDF, or paste the QR JSON payload if available. Press Ctrl+Enter to validate.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={validateTicket}
              disabled={loading || !codeInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Validate Ticket</span>
                </>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.valid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-8 h-8 ${result.valid ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {result.valid ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${result.valid ? 'text-green-900' : 'text-red-900'}`}>
                {result.valid ? 'Ticket Valid!' : 'Invalid Ticket'}
              </h3>
              <p className={`${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
            </div>

            {result.valid && result.ticket && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Ticket Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Ticket ID:</span>
                    <p className="text-gray-900">{result.ticket.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <p className="text-gray-900">{result.ticket.type.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Amount:</span>
                    <p className="text-gray-900">₹{result.ticket.amount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date:</span>
                    <p className="text-gray-900">{new Date(result.ticket.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {result.user && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Attendee Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900">{result.user.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{result.user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setResult(null);
                  setTicketId('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Validate Another Ticket
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketValidator;
