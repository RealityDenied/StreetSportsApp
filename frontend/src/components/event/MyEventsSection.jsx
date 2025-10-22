import { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import EventCard from './EventCard';
import socketService from '../../services/socket';

const MyEventsSection = ({ onEventClick, sportFilter = 'all' }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Check scrollability when events change
  useEffect(() => {
    checkScrollability();
  }, [events]);

  // Filter events based on sport filter
  const filteredEvents = events.filter(event => {
    if (sportFilter === 'all') return true;
    return event.sportType?.toLowerCase() === sportFilter.toLowerCase();
  });

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
      // Fetch events where user is organizer
      const organizerResponse = await api.get('/events/my-events');
      const organizerEvents = organizerResponse.data.events || [];
      
      // Fetch events where user is a team member
      const memberResponse = await api.get('/events/my-participations');
      const memberEvents = memberResponse.data.events || [];
      
      // Combine and deduplicate events
      const allEvents = [...organizerEvents.map(event => ({ ...event, userRole: 'organizer' }))];
      memberEvents.forEach(event => {
        if (!allEvents.find(e => e._id === event._id)) {
          allEvents.push({ ...event, userRole: 'member' });
        } else {
          // Update existing event to show user is both organizer and member
          const existingIndex = allEvents.findIndex(e => e._id === event._id);
          allEvents[existingIndex] = { ...allEvents[existingIndex], userRole: 'organizer-member' };
        }
      });
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
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
        <h2 className="text-gray-900 text-xl font-bold">My Events & Participations</h2>
        <div className="flex items-center space-x-3">
          <span className="text-gray-600 text-sm">{filteredEvents.length} events</span>
          {filteredEvents.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canScrollLeft 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canScrollRight 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600 text-lg mb-2">No events yet</p>
          <p className="text-gray-500 text-sm">
            {sportFilter === 'all' 
              ? "You haven't created or joined any events yet. Create your first event to get started!"
              : `No ${sportFilter} events found. Try selecting a different sport or create a new event.`
            }
          </p>
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
            onScroll={checkScrollability}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredEvents.map(event => (
              <div key={event._id} className="flex-shrink-0 w-72">
                <EventCard
                  event={event}
                  userRole={event.userRole}
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
