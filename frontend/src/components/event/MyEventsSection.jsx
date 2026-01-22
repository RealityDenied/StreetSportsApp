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
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 2;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sportFilter]);

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
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-700 rounded mb-4"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-64 h-32 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">My Events & Participations</h2>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 text-sm">{filteredEvents.length} events</span>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  currentPage === 1 
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-700 hover:bg-amber-500 hover:text-white text-neutral-300'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-neutral-400">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  currentPage === totalPages 
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-700 hover:bg-amber-500 hover:text-white text-neutral-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-white text-lg mb-2">No events yet</p>
          <p className="text-neutral-400 text-sm">
            {sportFilter === 'all' 
              ? "You haven't created or joined any events yet. Create your first event to get started!"
              : `No ${sportFilter} events found. Try selecting a different sport or create a new event.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              userRole={event.userRole}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsSection;
