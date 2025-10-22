import { useState } from 'react';
import api from '../../api/api';
import Toast from '../ui/Toast';

const EventCard = ({ event, userRole = null, onEventClick }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
            <p className="font-medium text-xs">Matches</p>
            <p className="text-gray-900 text-lg font-semibold">{event.matches?.length || 0}</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">
              {formatDate(event.createdAt)}
            </span>
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
