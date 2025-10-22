import { useState, useEffect } from 'react';
import api from '../../api/api';

const PendingPlayersModal = ({ isOpen, onClose, eventId, onPlayerApproved, onPlayerRejected }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState({});
  const [rejecting, setRejecting] = useState({});

  useEffect(() => {
    if (isOpen && eventId) {
      fetchPendingPlayers();
    }
  }, [isOpen, eventId]);

  const fetchPendingPlayers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${eventId}/players/pending`);
      setParticipants(response.data.participants);
    } catch (error) {
      console.error('Error fetching pending players:', error);
      alert('Error fetching pending players');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, teamId = null) => {
    setApproving(prev => ({ ...prev, [userId]: true }));
    try {
      await api.post(`/events/${eventId}/players/${userId}/approve`, { teamId });
      setParticipants(prev => prev.filter(p => p._id !== userId));
      onPlayerApproved && onPlayerApproved(userId, teamId);
      alert('Player approved successfully!');
    } catch (error) {
      console.error('Error approving player:', error);
      alert('Error approving player');
    } finally {
      setApproving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    setRejecting(prev => ({ ...prev, [userId]: true }));
    try {
      await api.delete(`/events/${eventId}/players/${userId}/reject`);
      setParticipants(prev => prev.filter(p => p._id !== userId));
      onPlayerRejected && onPlayerRejected(userId);
      alert('Player application rejected');
    } catch (error) {
      console.error('Error rejecting player:', error);
      alert('Error rejecting player');
    } finally {
      setRejecting(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 text-xl font-bold">Pending Player Applications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending applications...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-600">No pending player applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{participant.name}</h3>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {participant.favoriteSport}
                      </span>
                      {participant.city && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {participant.city}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(participant._id)}
                      disabled={approving[participant._id]}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {approving[participant._id] ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(participant._id)}
                      disabled={rejecting[participant._id]}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {rejecting[participant._id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingPlayersModal;
