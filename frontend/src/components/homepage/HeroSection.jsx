import { useState } from 'react';

const HeroSection = ({ onCreateEvent, onExploreEvents }) => {
  // Professional basketball image - horizontal layout with man playing
  const heroImage = "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

  return (
    <div className="relative h-[240px] sm:h-[280px] overflow-hidden border-b border-neutral-800">
      {/* Background Image */}
      <img 
        src={heroImage} 
        alt="Street Sports" 
        className="w-full h-full object-cover opacity-20"
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-neutral-900/80">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center h-full">
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-3 sm:mb-4 leading-tight">
                Welcome to <span className="text-neutral-400">StreetSports</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 mb-4 sm:mb-6 max-w-2xl leading-relaxed">
                Organize, manage, and showcase your street sports events. 
                Create tournaments, track matches, and connect with your local sports community.
              </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={onCreateEvent}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold active:scale-[0.98] transition-all duration-200 text-sm shadow-lg shadow-amber-500/20"
                style={{ aspectRatio: '2.618 / 1' }}
              >
                Create Event
              </button>
              <button 
                onClick={onExploreEvents}
                className="bg-neutral-800 border border-neutral-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-700 active:scale-[0.98] transition-all duration-200 text-sm"
                style={{ aspectRatio: '2.618 / 1' }}
              >
                Explore Events
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
