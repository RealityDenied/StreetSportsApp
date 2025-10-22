import { useState, useRef, useEffect } from 'react';
import api from '../../api/api';

const QRScanner = ({ isOpen, onClose, eventId }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setResult(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convert canvas to data URL for QR code detection
    const imageData = canvas.toDataURL('image/png');
    
    // For now, we'll simulate QR code detection
    // In a real implementation, you'd use a QR code detection library
    simulateQRDetection(imageData);
  };

  const simulateQRDetection = async (imageData) => {
    // Simulate QR code detection - in real implementation, use a library like jsQR
    // For demo purposes, we'll create a mock QR result
    const mockQRData = {
      ticketId: 'TICKET_1234567890_ABC123',
      eventId: eventId,
      userId: 'user123',
      type: 'audience',
      timestamp: new Date().toISOString()
    };

    try {
      // Verify the ticket with backend
      const response = await api.post(`/events/${eventId}/verify-ticket`, {
        qrData: mockQRData
      });

      setResult({
        valid: true,
        ticket: response.data.ticket,
        user: response.data.user,
        message: 'Ticket verified successfully!'
      });
      stopScanning();
    } catch (error) {
      setResult({
        valid: false,
        message: 'Invalid or expired ticket'
      });
      stopScanning();
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setError(null);
    startScanning();
  };

  const handleClose = () => {
    stopScanning();
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">QR Code Scanner</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!result && !error && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Position the QR code within the camera view to scan
              </p>
            </div>

            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Scanning...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={captureFrame}
                disabled={!scanning}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Capture & Scan</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Camera Error</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={handleScanAgain}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
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
                {result.valid ? 'Ticket Verified!' : 'Invalid Ticket'}
              </h3>
              <p className={`${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
            </div>

            {result.valid && result.ticket && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-gray-900">Ticket Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Attendee Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                onClick={handleScanAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Scan Another Ticket
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Close Scanner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
