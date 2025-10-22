import { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import EventCard from './EventCard';
import socketService from '../../services/socket';

const AllEventsPanel = ({ onEventClick, sportFilter = 'all' }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Check scrollability when events change
  useEffect(() => {
    checkScrollability();
  }, [events]);

  // Filter events based on sport filter and search query
  const filteredEvents = events.filter(event => {
    const matchesSport = sportFilter === 'all' || event.sportType?.toLowerCase() === sportFilter.toLowerCase();
    const matchesSearch = event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  // Listen for WebSocket events
  useEffect(() => {
    if (!socketService.isSocketConnected()) return;

    const handleEventCreated = () => {
      fetchAllEvents(); // Refresh events list
    };

    const handleTeamCreated = () => {
      fetchAllEvents(); // Refresh events list
    };

    const handleMatchCreated = () => {
      fetchAllEvents(); // Refresh events list
    };

    const handleMatchResultUpdated = () => {
      fetchAllEvents(); // Refresh events list
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

  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/events/all');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
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
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 text-xl font-bold">All Events</h2>
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

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div 
        ref={scrollContainerRef}
        className="space-y-3"
        onScroll={checkScrollability}
      >
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 text-sm">
              {sportFilter === 'all' 
                ? "No events match your search criteria. Try adjusting your search or create a new event."
                : `No ${sportFilter} events found. Try selecting a different sport or create a new event.`
              }
            </p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="flex-shrink-0">
              <EventCard
                event={event}
                onEventClick={onEventClick}
                compact={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllEventsPanel;
