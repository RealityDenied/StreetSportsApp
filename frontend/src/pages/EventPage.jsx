import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import PosterUpload from '../components/event/PosterUpload';
import TeamManagement from '../components/team/TeamManagement';
import MatchManagement from '../components/event/MatchManagement';
import QuickCreateModal from '../components/event/QuickCreateModal';

const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('team');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event data first
        const eventResponse = await api.get(`/events/${eventId}`);
        const eventData = eventResponse.data.event;
        setEvent(eventData);
        
        // Try to fetch current user data
        let currentUser = null;
        try {
          const userResponse = await api.get('/user/me');
          currentUser = userResponse.data;
        } catch (userErr) {
          console.warn('Could not fetch user data:', userErr);
          // Fallback to localStorage if available
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
          }
        }
        
        // Handle both cases: organiser as object or as string ID
        const organiserId = typeof eventData.organiser === 'object' 
          ? eventData.organiser._id 
          : eventData.organiser;
        
        const isUserOrganizer = currentUser && currentUser._id === organiserId;
        
        setIsOrganizer(isUserOrganizer);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Event not found or access denied');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSportIcon = (sport) => {
    const icons = {
      'Cricket': '🏏',
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Volleyball': '🏐',
      'Badminton': '🏸',
      'Table Tennis': '🏓',
      'Other': '🏆'
    };
    return icons[sport] || '🏆';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const handlePosterUpdated = (poster) => {
    setEvent(prev => ({ ...prev, poster }));
  };

  const handleTeamCreated = (team) => {
    setEvent(prev => ({ ...prev, teams: [...(prev.teams || []), team] }));
  };

  const handleMatchCreated = (match) => {
    setEvent(prev => ({ ...prev, matches: [...(prev.matches || []), match] }));
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalType === 'team') {
        const response = await api.post(`/events/${event._id}/teams/create`, data);
        handleTeamCreated(response.data.team);
        alert('Team created successfully!');
      } else if (modalType === 'match') {
        const response = await api.post(`/events/${event._id}/matches/create`, {
          teams: [data.team1, data.team2]
        });
        handleMatchCreated(response.data.match);
        alert('Match created successfully!');
      }
    } catch (error) {
      console.error(`Error creating ${modalType}:`, error);
      alert(`Error creating ${modalType}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-semibold animate-pulse">
            Loading event...
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => window.location.href = '/home'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/home'}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SS</span>
              </div>
              <h1 className="text-gray-900 text-xl font-bold">Street Sports INC</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Actions for Organizers */}
        {isOrganizer && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    if (!file.type.startsWith('image/')) {
                      alert('Please select an image file');
                      return;
                    }
                    
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size must be less than 5MB');
                      return;
                    }
                    
                    try {
                      const formData = new FormData();
                      formData.append('poster', file);
                      const response = await api.post(`/events/${event._id}/poster/upload`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      handlePosterUpdated(response.data.poster);
                      alert('Poster uploaded successfully!');
                    } catch (error) {
                      console.error('Error uploading poster:', error);
                      alert('Error uploading poster. Please try again.');
                    }
                  };
                  fileInput.click();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload Poster</span>
              </button>
              
              <button
                onClick={() => {
                  setModalType('team');
                  setShowModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Team</span>
              </button>
              
              <button
                onClick={() => {
                  if (event.teams?.length < 2) {
                    alert('You need at least 2 teams to create a match');
                    return;
                  }
                  setModalType('match');
                  setShowModal(true);
                }}
                disabled={event.teams?.length < 2}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Create Match</span>
              </button>
            </div>
          </div>
        )}

        {/* Event Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{getSportIcon(event.sportType)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.eventName}</h1>
                <p className="text-xl text-gray-600">{event.sportType}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              {isOrganizer && (
                <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800">
                  Organizer
                </span>
              )}
            </div>
          </div>

          {/* Event Details with Poster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Start Date</h3>
                    <p className="text-gray-600">{formatDate(event.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Deadline</h3>
                    <p className="text-gray-600">{formatDate(event.registrationDeadline)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teams</h3>
                    <p className="text-2xl font-bold text-blue-600">{event.teams?.length || 0}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Matches</h3>
                    <p className="text-2xl font-bold text-blue-600">{event.matches?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Event Poster */}
            <div className="lg:col-span-1">
              <div className="w-full max-w-xs mx-auto">
                <PosterUpload 
                  event={event} 
                  isOrganizer={isOrganizer} 
                  onPosterUpdated={handlePosterUpdated}
                />
              </div>
            </div>
          </div>


          {/* Event Link */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Link</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                {window.location.origin}/event/{event._id}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/event/${event._id}`);
                  alert('Event link copied to clipboard!');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Teams Management */}
        <div className="mb-6">
          <TeamManagement 
            event={event} 
            isOrganizer={isOrganizer} 
            onTeamCreated={handleTeamCreated}
          />
        </div>

        {/* Matches Management */}
        <div className="mb-6">
          <MatchManagement 
            event={event} 
            isOrganizer={isOrganizer} 
            onMatchCreated={handleMatchCreated}
          />
        </div>
      </main>

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        onSubmit={handleModalSubmit}
        teams={event?.teams || []}
      />
    </div>
  );
};

export default EventPage;
