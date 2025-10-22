import { useState } from 'react';

const HeroSection = ({ onCreateEvent, onExploreEvents }) => {
  // Professional basketball image - horizontal layout with man playing
  const heroImage = "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

  return (
    <div className="relative h-[200px] overflow-hidden">
      {/* Background Image */}
      <img 
        src={heroImage} 
        alt="Street Sports" 
        className="w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60">
        <div className="flex flex-col justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              Welcome to Street Sports INC
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 max-w-2xl">
              Organize, manage, and showcase your street sports events with ease. 
              Create tournaments, track matches, and share highlights with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={onCreateEvent}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              >
                Create Event
              </button>
              <button 
                onClick={onExploreEvents}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                Explore Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
