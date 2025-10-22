import { useState } from 'react';
import api from '../../api/api';
import Toast from '../ui/Toast';

const EventCard = ({ event, userRole = null, onEventClick }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Debug: Log poster URL and event data
  console.log('EventCard event:', event);
  console.log('EventCard poster:', event?.poster);
  console.log('EventCard eventName:', event?.eventName);
  
  // Extract poster URL from object or string
  const getPosterUrl = (poster) => {
    if (!poster) return null;
    if (typeof poster === 'string') return poster;
    if (typeof poster === 'object' && poster.url) return poster.url;
    if (typeof poster === 'object' && poster.public_id) return `https://res.cloudinary.com/${poster.cloud_name || 'your-cloud-name'}/image/upload/${poster.public_id}`;
    return null;
  };
  
  const posterUrl = getPosterUrl(event?.poster);
  console.log('Extracted poster URL:', posterUrl);
  
  // Use the local placeholder image for all events without posters
  const placeholderUrl = '/src/placeholderevent.jpg';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
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

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      const eventLink = `${window.location.origin}/event/${event._id}`;
      await navigator.clipboard.writeText(eventLink);
      setToastMessage('Event link copied to clipboard!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to copy link');
      setShowToast(true);
    }
  };

  const handleCardClick = () => {
    window.open(`/event/${event._id}`, '_blank');
  };

  const getRoleIndicator = () => {
    if (!userRole) return null;
    
    const roleConfig = {
      'organizer': {
        color: 'bg-yellow-400',
        tooltip: 'Organizer'
      },
      'member': {
        color: 'bg-blue-400',
        tooltip: 'Player'
      },
      'organizer-member': {
        color: 'bg-yellow-400',
        tooltip: 'Organizer & Player'
      }
    };

    const config = roleConfig[userRole];
    if (!config) return null;

    return (
      <div 
        className={`w-3 h-3 rounded-full ${config.color} border border-white shadow-sm`}
        title={config.tooltip}
      />
    );
  };

  return (
    <>
      <div 
        className="bg-white border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 w-full shadow-sm"
        onClick={handleCardClick}
      >
        {/* Poster Image Section - Always show for uniform card size */}
        <div className="mb-3">
          <img 
            src={posterUrl || placeholderUrl} 
            alt={posterUrl ? `${event.eventName} poster` : `${event.sportType} placeholder`}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              console.error('Image failed to load:', posterUrl || placeholderUrl);
              // If both poster and placeholder fail, show a solid color background
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = '#f3f4f6';
              e.target.parentElement.style.display = 'flex';
              e.target.parentElement.style.alignItems = 'center';
              e.target.parentElement.style.justifyContent = 'center';
              e.target.parentElement.innerHTML = `<div class="text-gray-500 text-sm">${getSportIcon(event.sportType)} ${event.sportType}</div>`;
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', posterUrl || placeholderUrl);
            }}
          />
        </div>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">{getSportIcon(event.sportType)}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 font-semibold text-sm sm:text-lg truncate">{event.eventName}</h3>
              <p className="text-gray-600 text-xs sm:text-sm">{event.sportType}</p>
            </div>
          </div>
          {getRoleIndicator()}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
          <div className="text-center">
            <p className="font-medium text-xs">Teams</p>
            <p className="text-gray-900 text-lg font-semibold">{event.teams?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-xs">Participants</p>
            <p className="text-gray-900 text-lg font-semibold">{event.participants?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-xs">Audience</p>
            <p className="text-gray-900 text-lg font-semibold">{event.audience?.users?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-xs">Matches</p>
            <p className="text-gray-900 text-lg font-semibold">{event.matches?.length || 0}</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs">
                {formatDate(event.createdAt)}
              </span>
              {event.duration && (
                <span className="text-gray-500 text-xs">
                  {event.duration} day{event.duration > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500 text-xs truncate max-w-[60px] sm:max-w-[80px]">
                {event._id.slice(-6)}
              </span>
              <button
                onClick={handleCopyLink}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded flex-shrink-0"
                title="Copy event link"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
          </div>
        </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default EventCard;
