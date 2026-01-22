import { useState, useEffect } from 'react';

const StatCard = ({ icon, value, label, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-neutral-800 border border-neutral-700 rounded-xl p-6 transform transition-all duration-500 hover:border-amber-500/50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-3xl font-semibold text-white mb-2">
        {value}
      </div>
      <div className="text-neutral-400 font-medium text-sm">
        {label}
      </div>
    </div>
  );
};

const StatisticsSection = ({ events = [] }) => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activePlayers: 0,
    totalMatches: 0,
    liveEvents: 0
  });

  useEffect(() => {
    if (events.length > 0) {
      // Calculate statistics from events data
      const totalEvents = events.length;
      
      // Count active players (participants + audience)
      let activePlayers = 0;
      events.forEach(event => {
        // Add participants
        activePlayers += event.participants?.length || 0;
        
        // Add audience members
        if (event.audience?.users) {
          activePlayers += event.audience.users.length;
        }
      });

      // Count total matches
      let totalMatches = 0;
      events.forEach(event => {
        totalMatches += event.matches?.length || 0;
      });

      // Count live events (events with status 'active' or 'ongoing')
      const liveEvents = events.filter(event => 
        event.status === 'active' || event.status === 'ongoing'
      ).length;

      setStats({
        totalEvents,
        activePlayers,
        totalMatches,
        liveEvents
      });
    }
  }, [events]);

  return (
    <div className="py-0">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Platform Statistics</h2>
        <p className="text-neutral-400 text-sm">Track the growth of our street sports community</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          value={stats.totalEvents}
          label="Total Events"
          delay={0}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          value={stats.activePlayers}
          label="Active Players"
          delay={100}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          value={stats.totalMatches}
          label="Total Matches"
          delay={200}
        />

        <StatCard
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          value={stats.liveEvents}
          label="Live Events"
          delay={300}
        />
      </div>
    </div>
  );
};

export default StatisticsSection;
