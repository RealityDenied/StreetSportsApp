import { useState, useEffect } from 'react';
import api from '../../api/api';
import socketService from '../../services/socket';

const NotificationBar = ({ onRequestUpdate }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    if (!socketService.isSocketConnected()) return;

    const handleRequestReceived = (data) => {
      console.log('New request received:', data);
      fetchNotifications(); // Refresh notifications
    };

    const handleRequestAccepted = (data) => {
      console.log('Request accepted:', data);
      fetchNotifications(); // Refresh notifications
    };

    const handleRequestRejected = (data) => {
      console.log('Request rejected:', data);
      fetchNotifications(); // Refresh notifications
    };

    socketService.onRequestReceived(handleRequestReceived);
    socketService.onRequestAccepted(handleRequestAccepted);
    socketService.onRequestRejected(handleRequestRejected);

    return () => {
      socketService.removeAllListeners('requestReceived');
      socketService.removeAllListeners('requestAccepted');
      socketService.removeAllListeners('requestRejected');
    };
  }, [socketService.isSocketConnected()]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/requests/notifications');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post(`/requests/${requestId}/accept`);
      setRequests(requests.filter(req => req._id !== requestId));
      onRequestUpdate && onRequestUpdate();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/requests/${requestId}/reject`);
      setRequests(requests.filter(req => req._id !== requestId));
      onRequestUpdate && onRequestUpdate();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
              </svg>
              <span className="text-white font-medium">Team Invitations</span>
            </div>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              {requests.length} pending
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {requests.map(request => (
            <div key={request._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">
                    Invited to join <span className="text-yellow-300">{request.team.teamName}</span> in <span className="text-green-300">{request.event.eventName}</span>
                  </p>
                  <p className="text-white/70 text-sm">
                    by {request.sender.name} • {request.event.sportType}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;
