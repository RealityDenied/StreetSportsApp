import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import PosterUpload from '../components/event/PosterUpload';
import TeamManagement from '../components/team/TeamManagement';
import MatchManagement from '../components/event/MatchManagement';
import QuickCreateModal from '../components/event/QuickCreateModal';
import PaymentRequiredModal from '../components/ui/PaymentRequiredModal';
import PendingPlayersModal from '../components/event/PendingPlayersModal';
import AudienceManagement from '../components/event/AudienceManagement';
import QRScanner from '../components/event/QRScanner';
import TicketValidator from '../components/event/TicketValidator';

const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('team');
  const [currentUser, setCurrentUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ fee: 0, type: '' });
  const [showPendingPlayersModal, setShowPendingPlayersModal] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showPlayersDropdown, setShowPlayersDropdown] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showTicketValidator, setShowTicketValidator] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event data first
        const eventResponse = await api.get(`/events/${eventId}`);
        const eventData = eventResponse.data.event;
        setEvent(eventData);
        
        // Try to fetch current user data
        let userData = null;
        try {
          const userResponse = await api.get('/user/me');
          userData = userResponse.data.user;
          setCurrentUser(userData);
        } catch (userErr) {
          console.warn('Could not fetch user data:', userErr);
          // Fallback to localStorage if available
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            userData = JSON.parse(storedUser);
            setCurrentUser(userData);
          }
        }
        
        // Handle both cases: organiser as object or as string ID
        const organiserId = typeof eventData.organiser === 'object' 
          ? eventData.organiser._id 
          : eventData.organiser;
        
        const isUserOrganizer = userData && userData._id === organiserId;
        
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

  // Check if user is already in audience
  const isInAudience = () => {
    if (!currentUser || !event?.audience?.users) return false;
    return event.audience.users.some(user => user._id === currentUser._id);
  };

  // Check if user is already a participant
  const isParticipant = () => {
    if (!currentUser || !event?.participants) return false;
    return event.participants.some(user => user._id === currentUser._id);
  };

  // Check if user is in any team
  const isInTeam = () => {
    if (!currentUser || !event?.teams) return false;
    return event.teams.some(team => 
      team.users && team.users.some(user => user._id === currentUser._id)
    );
  };

  // Calculate total players (both in teams and in participants array)
  const getTotalPlayersCount = () => {
    if (!event) return 0;
    
    // Count players in teams
    let playersInTeams = 0;
    if (event.teams) {
      playersInTeams = event.teams.reduce((total, team) => total + (team.users?.length || 0), 0);
    }
    
    // Count players in participants array (but not already counted in teams)
    let playersInParticipants = 0;
    if (event.participants) {
      // Get all user IDs from teams
      const teamUserIds = new Set();
      if (event.teams) {
        event.teams.forEach(team => {
          if (team.users) {
            team.users.forEach(user => {
              teamUserIds.add(user._id || user);
            });
          }
        });
      }
      
      // Count participants not in teams
      playersInParticipants = event.participants.filter(participantId => 
        !teamUserIds.has(participantId._id || participantId)
      ).length;
    }
    
    return playersInTeams + playersInParticipants;
  };

  // Get all players (both in teams and in participants)
  const getAllPlayers = () => {
    if (!event) return [];
    const allPlayers = [];
    
    // Add players from teams
    if (event.teams) {
      event.teams.forEach(team => {
        if (team.users) {
          team.users.forEach(user => {
            allPlayers.push({ ...user, teamName: team.teamName, source: 'team' });
          });
        }
      });
    }
    
    // Add players from participants array (but not already in teams)
    if (event.participants) {
      const teamUserIds = new Set();
      if (event.teams) {
        event.teams.forEach(team => {
          if (team.users) {
            team.users.forEach(user => {
              teamUserIds.add(user._id || user);
            });
          }
        });
      }
      
      event.participants.forEach(participant => {
        const participantId = participant._id || participant;
        if (!teamUserIds.has(participantId)) {
          allPlayers.push({ ...participant, teamName: 'No Team', source: 'participant' });
        }
      });
    }
    
    return allPlayers;
  };

  // Join as audience
  const handleJoinAudience = async () => {
    try {
      console.log('Attempting to join audience for event:', eventId);
      console.log('Event data:', {
        eventName: event?.eventName,
        audienceFree: event?.audienceFree,
        audienceFee: event?.audienceFee
      });
      const response = await api.post(`/events/${eventId}/audience/join`);
      alert('Joined audience successfully!');
      // Refresh event data
      window.location.reload();
    } catch (error) {
      console.error('Error joining audience:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 402) {
        console.log('Payment required, creating checkout session...');
        // Payment required - redirect to Stripe Checkout
        try {
          const checkoutResponse = await api.post(`/events/${eventId}/create-checkout-session`, {
            type: 'audience'
          });
          console.log('Checkout session created:', checkoutResponse.data);
          if (checkoutResponse.data.success) {
            window.location.href = checkoutResponse.data.url;
          } else {
            alert('Error creating payment session');
          }
        } catch (checkoutError) {
          console.error('Error creating checkout session:', checkoutError);
          console.error('Checkout error details:', {
            status: checkoutError.response?.status,
            message: checkoutError.response?.data?.message,
            data: checkoutError.response?.data
          });
          
          if (checkoutError.response?.status === 400 && 
              checkoutError.response?.data?.message?.includes('Minimum payment amount')) {
            alert(`Payment Error: ${checkoutError.response.data.message}\n\nPlease contact the event organizer to increase the fee to at least ₹40.`);
          } else if (checkoutError.response?.data?.message) {
            alert(`Payment Error: ${checkoutError.response.data.message}`);
          } else {
            alert('Error processing payment. Please try again.');
          }
        }
      } else {
        alert(error.response?.data?.message || 'Error joining audience');
      }
    }
  };

  // Apply as player
  const handleApplyAsPlayer = async () => {
    try {
      const response = await api.post(`/events/${eventId}/players/apply`);
      alert('Applied as player successfully!');
      // Refresh event data
      window.location.reload();
    } catch (error) {
      console.error('Error applying as player:', error);
      if (error.response?.status === 402) {
        // Payment required - redirect to Stripe Checkout
        try {
          const checkoutResponse = await api.post(`/events/${eventId}/create-checkout-session`, {
            type: 'player'
          });
          if (checkoutResponse.data.success) {
            window.location.href = checkoutResponse.data.url;
          } else {
            alert('Error creating payment session');
          }
        } catch (checkoutError) {
          console.error('Error creating checkout session:', checkoutError);
          if (checkoutError.response?.data?.message) {
            alert(`Payment Error: ${checkoutError.response.data.message}`);
          } else {
            alert('Error processing payment. Please try again.');
          }
        }
      } else {
        alert(error.response?.data?.message || 'Error applying as player');
      }
    }
  };

  // Apply to specific team
  const handleApplyToTeam = async (teamId) => {
    try {
      const response = await api.post(`/events/${eventId}/players/apply-to-team/${teamId}`);
      if (response.status === 402) {
        // Payment required - redirect to Stripe Checkout
        const checkoutResponse = await api.post(`/events/${eventId}/create-checkout-session`, {
          type: 'player'
        });
        if (checkoutResponse.data.success) {
          window.location.href = checkoutResponse.data.url;
        }
        return;
      }
      alert('Applied to team successfully!');
      // Refresh event data
      window.location.reload();
    } catch (error) {
      console.error('Error applying to team:', error);
      if (error.response?.status === 402) {
        try {
          const checkoutResponse = await api.post(`/events/${eventId}/create-checkout-session`, {
            type: 'player'
          });
          if (checkoutResponse.data.success) {
            window.location.href = checkoutResponse.data.url;
          }
        } catch (checkoutError) {
          console.error('Error creating checkout session:', checkoutError);
          alert('Error processing payment');
        }
      } else {
        alert(error.response?.data?.message || 'Error applying to team');
      }
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background overlay with subtle texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-gray-800/30 to-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-gray-100/95 backdrop-blur-md border-b border-gray-300 shadow-sm">
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
          <div className="bg-gray-200/90 border border-gray-300 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
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
              
              <button
                onClick={() => setShowPendingPlayersModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Pending Players ({event.participants?.length || 0})</span>
              </button>
              
              <button
                onClick={() => setShowQRScanner(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Scan QR Code</span>
              </button>
              
              <button
                onClick={() => setShowTicketValidator(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Validate Ticket</span>
              </button>
            </div>
          </div>
        )}

        {/* Event Header */}
        <div className="bg-gray-200/90 border border-gray-300 rounded-xl p-6 shadow-sm mb-6">
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Duration</h3>
                    <p className="text-gray-600">{event.duration} day{event.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teams</h3>
                    <p className="text-2xl font-bold text-blue-600">{event.teams?.length || 0}</p>
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Players</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-green-600">{getTotalPlayersCount()}</p>
                      <button
                        onClick={() => setShowPlayersDropdown(!showPlayersDropdown)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="View players list"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Players Dropdown */}
                    {showPlayersDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-200/95 border border-gray-300 rounded-lg shadow-lg z-10 w-80 max-h-60 overflow-y-auto">
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-900 mb-2">All Players</h4>
                          {getAllPlayers().length === 0 ? (
                            <p className="text-gray-500 text-sm">No players registered yet</p>
                          ) : (
                            <div className="space-y-2">
                              {getAllPlayers().map((player, index) => (
                                <div key={player._id || index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{player.name}</p>
                                    <p className="text-xs text-gray-600">{player.email}</p>
                                    <p className={`text-xs ${player.source === 'team' ? 'text-blue-600' : 'text-orange-600'}`}>
                                      {player.teamName} {player.source === 'team' ? '(In Team)' : '(No Team)'}
                                    </p>
                                  </div>
                                  {player.favoriteSport && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {player.favoriteSport}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Audience</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-purple-600">{event.audience?.users?.length || 0}</p>
                      <button
                        onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="View audience list"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Audience Dropdown */}
                    {showAudienceDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-200/95 border border-gray-300 rounded-lg shadow-lg z-10 w-80 max-h-60 overflow-y-auto">
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-900 mb-2">Audience Members</h4>
                          {(!event.audience?.users || event.audience.users.length === 0) ? (
                            <p className="text-gray-500 text-sm">No audience members yet</p>
                          ) : (
                            <div className="space-y-2">
                              {event.audience.users.map((member, index) => (
                                <div key={member._id || index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                    <p className="text-xs text-gray-600">{member.email}</p>
                                    {member.city && (
                                      <p className="text-xs text-gray-500">{member.city}</p>
                                    )}
                                  </div>
                                  {member.favoriteSport && (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      {member.favoriteSport}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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


          {/* Join/Apply Section - Only show if user is not organizer */}
          {currentUser && !isOrganizer && (
            <div className="bg-gray-200/90 border border-gray-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Join This Event</h3>
              <div className="flex flex-wrap gap-3">
                {/* Join as Audience */}
                {!isInAudience() && (
                  <button
                    onClick={handleJoinAudience}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>
                      Join as Audience {event.audienceFree ? '(Free)' : `(₹${event.audienceFee})`}
                    </span>
                  </button>
                )}
                
                {/* Apply as Player */}
                {!isParticipant() && !isInTeam() && (
                  <div className="relative">
                    <button
                      onClick={handleApplyAsPlayer}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>
                        Apply as Player {event.playerFree ? '(Free)' : `(₹${event.playerFee})`}
                      </span>
                    </button>
                    
                    {/* Apply to specific teams dropdown */}
                    {event.teams && event.teams.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-200/95 border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                        <div className="p-2">
                          <div className="text-xs text-gray-500 px-2 py-1">Or apply to specific team:</div>
                          {event.teams.map(team => (
                            <button
                              key={team._id}
                              onClick={() => handleApplyToTeam(team._id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                            >
                              {team.teamName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Status indicators */}
                {isInAudience() && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                    ✓ In Audience
                  </span>
                )}
                {isParticipant() && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium">
                    ⏳ Pending Approval
                  </span>
                )}
                {isInTeam() && (
                  <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                    ✓ Team Member
                  </span>
                )}
              </div>
            </div>
          )}

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

      {/* Payment Required Modal */}
      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        fee={paymentData.fee}
        type={paymentData.type}
      />

      {/* Pending Players Modal */}
      <PendingPlayersModal
        isOpen={showPendingPlayersModal}
        onClose={() => setShowPendingPlayersModal(false)}
        eventId={eventId}
        onPlayerApproved={() => {
          // Refresh event data
          window.location.reload();
        }}
        onPlayerRejected={() => {
          // Refresh event data
          window.location.reload();
        }}
      />

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        eventId={eventId}
      />

      {/* Ticket Validator Modal */}
      <TicketValidator
        isOpen={showTicketValidator}
        onClose={() => setShowTicketValidator(false)}
        eventId={eventId}
      />
      </div>
    </div>
  );
};

export default EventPage;
