import { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import EventCard from './EventCard';
import socketService from '../../services/socket';

const MyEventsSection = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    if (!socketService.isSocketConnected()) return;

    const handleEventCreated = () => {
      fetchMyEvents(); // Refresh events list
    };

    const handleTeamCreated = () => {
      fetchMyEvents(); // Refresh events list
    };

    const handleMatchCreated = () => {
      fetchMyEvents(); // Refresh events list
    };

    const handleMatchResultUpdated = () => {
      fetchMyEvents(); // Refresh events list
    };

    socketService.onEventCreated(handleEventCreated);
    socketService.onTeamCreated(handleTeamCreated);
    socketService.onMatchCreated(handleMatchCreated);
    socketService.onMatchResultUpdated(handleMatchResultUpdated);

    return () => {
      socketService.removeAllListeners('eventCreated');
      socketService.removeAllListeners('teamCreated');
      socketService.removeAllListeners('matchCreated');
      socketService.removeAllListeners('matchResultUpdated');
    };
  }, [socketService.isSocketConnected()]);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/events/my-events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300, // Scroll by card width + gap
        behavior: 'smooth'
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300, // Scroll by card width + gap
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-64 h-32 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 text-xl font-bold">My Events</h2>
        <div className="flex items-center space-x-3">
          <span className="text-gray-600 text-sm">{events.length} events</span>
          {events.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={scrollLeft}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Scroll left"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Scroll right"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600 text-lg mb-2">No events created yet</p>
          <p className="text-gray-500 text-sm">Create your first event to get started!</p>
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map(event => (
              <div key={event._id} className="flex-shrink-0 w-72">
                <EventCard
                  event={event}
                  isOrganizer={true}
                  onEventClick={onEventClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsSection;
