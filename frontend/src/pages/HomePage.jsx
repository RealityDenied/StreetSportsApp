import { useEffect, useState } from "react";
import api from "../api/api";
import socketService from "../services/socket";
import NotificationBar from "../components/ui/NotificationBar";
import MyEventsSection from "../components/event/MyEventsSection";
import AllEventsPanel from "../components/event/AllEventsPanel";
import CreateEventModal from "../components/event/CreateEventModal";
import Toast from "../components/ui/Toast";
import ProfessionalNavbar from "../components/ui/ProfessionalNavbar";
import { 
  HeroSection, 
  GlobalHighlightsCarousel, 
  StatisticsSection, 
  SportsCategories 
} from "../components/homepage";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedSport, setSelectedSport] = useState('all');
  const [allEvents, setAllEvents] = useState([]);
  const [globalHighlights, setGlobalHighlights] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data.user);
        
        // Connect to WebSocket
        const token = localStorage.getItem("token");
        if (token) {
          socketService.connect(token, res.data.user._id);
        }
      } catch (err) {
        console.error(err);
        showToast("Session expired, please login again", "error");
        localStorage.removeItem("token");
        window.location.href = "/auth";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Fetch all events and process global highlights
  useEffect(() => {
    const fetchEventsAndHighlights = async () => {
      try {
        const response = await api.get('/events/all');
        const events = response.data.events;
        setAllEvents(events);
        
        // Extract all highlights from all events
        const highlights = [];
        events.forEach(event => {
          console.log('Processing event:', event.eventName);
          console.log('Event matches:', event.matches);
          
          event.matches?.forEach(match => {
            console.log('Processing match:', match);
            console.log('Match highlights:', match.highlights);
            
            match.highlights?.forEach(highlight => {
              console.log('Processing highlight:', highlight);
              
              // Extract media URL from the media property
              let mediaUrl = null;
              if (highlight.media && highlight.media.url) {
                mediaUrl = highlight.media.url;
              }
              
              console.log('Extracted mediaUrl:', mediaUrl);
              
              // Extract team names from team objects
              let teamNames = [];
              if (match.teams && Array.isArray(match.teams)) {
                teamNames = match.teams.map(team => {
                  if (typeof team === 'object' && team.teamName) {
                    return team.teamName;
                  } else if (typeof team === 'string') {
                    return team; // If it's already a string, use as is
                  }
                  return 'Unknown Team';
                });
              }
              
              highlights.push({
                ...highlight,
                mediaUrl: mediaUrl,
                eventName: event.eventName,
                matchDetails: {
                  teams: teamNames,
                  date: match.scheduledDate ? new Date(match.scheduledDate) : null
                }
              });
            });
          });
        });
        
        // Sort by createdAt and take 3 most recent
        const recentHighlights = highlights
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        
        console.log('All highlights found:', highlights.length);
        console.log('Recent highlights:', recentHighlights);
        console.log('Sample highlight:', recentHighlights[0]);
        
        setGlobalHighlights(recentHighlights);
      } catch (error) {
        console.error('Error fetching events and highlights:', error);
        console.error('Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data
        });
        
        // Set empty arrays to prevent further errors
        setAllEvents([]);
        setGlobalHighlights([]);
      }
    };

    fetchEventsAndHighlights();
  }, []);

  // WebSocket event listeners
  useEffect(() => {
    if (!socketService.isSocketConnected()) return;

    const handleEventCreated = (data) => {
      console.log('New event created:', data);
      // Trigger refresh of events lists
      window.location.reload(); // Temporary - will be replaced with state updates
    };

    const handleTeamCreated = (data) => {
      console.log('New team created:', data);
      // Update UI to reflect new team
    };

    const handleMatchCreated = (data) => {
      console.log('New match created:', data);
      // Update UI to reflect new match
    };

    const handleMatchResultUpdated = (data) => {
      console.log('Match result updated:', data);
      // Update UI to reflect match results
    };

    const handleRequestReceived = (data) => {
      console.log('New request received:', data);
      // Show notification or update notification bar
    };

    const handleRequestAccepted = (data) => {
      console.log('Request accepted:', data);
      // Update UI to reflect accepted request
    };

    const handleRequestRejected = (data) => {
      console.log('Request rejected:', data);
      // Update UI to reflect rejected request
    };

    // Register event listeners
    socketService.onEventCreated(handleEventCreated);
    socketService.onTeamCreated(handleTeamCreated);
    socketService.onMatchCreated(handleMatchCreated);
    socketService.onMatchResultUpdated(handleMatchResultUpdated);
    socketService.onRequestReceived(handleRequestReceived);
    socketService.onRequestAccepted(handleRequestAccepted);
    socketService.onRequestRejected(handleRequestRejected);

    // Cleanup listeners
    return () => {
      socketService.removeAllListeners('eventCreated');
      socketService.removeAllListeners('teamCreated');
      socketService.removeAllListeners('matchCreated');
      socketService.removeAllListeners('matchResultUpdated');
      socketService.removeAllListeners('requestReceived');
      socketService.removeAllListeners('requestAccepted');
      socketService.removeAllListeners('requestRejected');
    };
  }, [socketService.isSocketConnected()]);

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const handleEventCreated = (event) => {
    // This will trigger a refresh of the events lists
    window.location.reload(); // Temporary - will be replaced with WebSocket updates
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    // Could open event details modal or navigate to event page
    console.log('Event clicked:', event);
  };

  const handleRequestUpdate = () => {
    // Refresh notifications or update UI
    console.log('Request updated');
  };

  const handleSportFilter = (sportId) => {
    setSelectedSport(sportId);
  };

  const handleScrollToSection = (section) => {
    const element = document.querySelector(`.${section}-section`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleExploreEvents = () => {
    // Scroll to events section or focus on events
    const eventsSection = document.querySelector('.events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-700 border-t-amber-500 mx-auto mb-4"></div>
          <div className="text-neutral-300 text-base font-medium">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen overflow-hidden bg-neutral-900">
      {/* Header/Navbar */}
      <ProfessionalNavbar 
        user={user} 
        onLogout={handleLogout}
        onScrollToSection={handleScrollToSection}
      />

      {/* Notification Bar */}
      <NotificationBar onRequestUpdate={handleRequestUpdate} />

      {/* Hero Section */}
      <HeroSection 
        onCreateEvent={handleCreateEvent}
        onExploreEvents={handleExploreEvents}
      />

      {/* Main Content Container - Natural Flow */}
      <div className="bg-neutral-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Global Highlights Carousel */}
          <div className="highlights-section mb-8">
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50">
              <GlobalHighlightsCarousel highlights={globalHighlights} />
            </div>
          </div>
          
          {/* Statistics Section */}
          <div className="statistics-section mb-8">
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50">
              <StatisticsSection events={allEvents} />
            </div>
          </div>
          
          {/* Sports Categories Filter */}
          <div className="mb-8">
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50">
              <SportsCategories 
                onFilterChange={handleSportFilter}
                selectedSport={selectedSport}
              />
            </div>
          </div>
          
          {/* Events Grid */}
          <div className="events-section grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* My Events Section - Left Column (60%) */}
            <div className="xl:col-span-2">
              <MyEventsSection 
                sportFilter={selectedSport}
                onEventClick={handleEventClick} 
              />
            </div>

            {/* All Events Section - Right Column (40%) */}
            <div className="xl:col-span-1">
              <AllEventsPanel 
                sportFilter={selectedSport}
                onEventClick={handleEventClick} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Golden Ratio */}
      <button
        onClick={handleCreateEvent}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center z-30"
        style={{ width: '64px', height: '64px' }}
        aria-label="Create new event"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Event Details Modal (placeholder for future implementation) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">{selectedEvent.eventName}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-neutral-300 space-y-2 text-sm">
              <p><span className="text-neutral-500">Sport:</span> {selectedEvent.sportType}</p>
              <p><span className="text-neutral-500">Teams:</span> {selectedEvent.teams?.length || 0}</p>
              <p><span className="text-neutral-500">Matches:</span> {selectedEvent.matches?.length || 0}</p>
              <p><span className="text-neutral-500">Status:</span> {selectedEvent.status}</p>
            </div>
          </div>
        </div>
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
}
