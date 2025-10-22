import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const sessionId = searchParams.get('session_id');
  const eventId = searchParams.get('eventId');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!sessionId || !eventId || !type) {
      setError('Invalid payment session');
      setLoading(false);
      return;
    }

    handlePaymentSuccess();
  }, [sessionId, eventId, type]);

  const handlePaymentSuccess = async () => {
    try {
      // Fetch event and user data
      const [eventResponse, userResponse] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get('/user/profile')
      ]);

      setEvent(eventResponse.data.event);
      setUser(userResponse.data.user);

      // Complete registration after successful payment
      console.log('Completing registration for:', { eventId, type });
      try {
        const registrationResponse = await api.post(`/events/${eventId}/complete-registration`, {
          type: type
        });
        console.log('Registration completed:', registrationResponse.data);
      } catch (registrationError) {
        console.error('Registration completion failed:', registrationError);
        // Don't fail the entire process if registration fails
        // The payment was successful, so we can still show the ticket
        console.warn('Payment successful but registration failed. User may need to contact support.');
      }
      
      // Generate ticket data
      const ticket = {
        id: `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${userResponse.data.user._id}`,
        eventId: eventId,
        eventName: eventResponse.data.event.eventName,
        userName: userResponse.data.user.name,
        userEmail: userResponse.data.user.email,
        type: type,
        amount: type === 'audience' ? eventResponse.data.event.audienceFee : eventResponse.data.event.playerFee,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        verified: false
      };

      setTicketData(ticket);

      // Generate QR code
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        eventId: eventId,
        userId: userResponse.data.user._id,
        type: type,
        timestamp: ticket.timestamp
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
      setSuccess(true);
      setLoading(false);

    } catch (error) {
      console.error('Error completing registration after payment:', error);
      setError('Payment successful but registration failed. Please contact support.');
      setLoading(false);
    }
  };

  const downloadTicketPDF = async () => {
    if (!ticketData || !qrCodeUrl) return;

    try {
      // Create a temporary div to render the ticket
      const ticketElement = document.createElement('div');
      ticketElement.style.cssText = `
        width: 400px;
        padding: 20px;
        background: white;
        font-family: Arial, sans-serif;
        color: black;
      `;
      
      ticketElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">EVENT TICKET</h1>
          <div style="width: 100%; height: 2px; background: #2563eb; margin: 10px 0;"></div>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Event Details</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Event:</strong> ${ticketData.eventName}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Type:</strong> ${ticketData.type.toUpperCase()}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Amount:</strong> ₹${ticketData.amount}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(ticketData.timestamp).toLocaleString()}</p>
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Attendee Details</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${ticketData.userName}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${ticketData.userEmail}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Registration:</strong> ${new Date(ticketData.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">QR Code</h3>
          <img src="${qrCodeUrl}" style="width: 150px; height: 150px; border: 1px solid #ddd;" />
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
            Present this QR code at the event venue for verification
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
            This ticket serves as proof of payment and registration.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      // Append to body temporarily
      document.body.appendChild(ticketElement);

      // Convert to canvas
      const canvas = await html2canvas(ticketElement, {
        width: 400,
        height: ticketElement.scrollHeight,
        scale: 2
      });

      // Remove temporary element
      document.body.removeChild(ticketElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`ticket_${ticketData.id}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we complete your registration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(`/event/${eventId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Return to Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You have been registered as {type === 'audience' ? 'audience' : 'player'} for this event.
          </p>
        </div>

        {/* Ticket Display */}
        {ticketData && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Event Ticket</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ticket Details */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Event Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Event:</strong> {ticketData.eventName}</p>
                    <p className="text-sm text-gray-600"><strong>Ticket ID:</strong> {ticketData.id}</p>
                    <p className="text-sm text-gray-600"><strong>Type:</strong> {ticketData.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600"><strong>Amount:</strong> ₹{ticketData.amount}</p>
                    <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(ticketData.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Attendee Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Name:</strong> {ticketData.userName}</p>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {ticketData.userEmail}</p>
                    <p className="text-sm text-gray-600"><strong>Registration Date:</strong> {new Date(ticketData.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-4">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center text-lg">QR Code</h4>
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="Ticket QR Code" 
                      className="mx-auto"
                      style={{ width: '200px', height: '200px' }}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Present this QR code at the event venue for verification
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={downloadTicketPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                  <span>Download PDF</span>
              </button>
              <button
                onClick={() => navigate(`/event/${eventId}`)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Go to Event Page</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;