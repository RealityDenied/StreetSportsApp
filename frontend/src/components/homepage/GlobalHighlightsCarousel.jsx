import { useState, useEffect, useRef } from 'react';

const GlobalHighlightsCarousel = ({ highlights = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Debug: Log highlights data
  console.log('GlobalHighlightsCarousel received highlights:', highlights);
  console.log('Highlights length:', highlights.length);
  if (highlights.length > 0) {
    console.log('First highlight:', highlights[0]);
  }

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && highlights.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === highlights.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, highlights.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? highlights.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === highlights.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (highlights.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Global Highlights</h2>
          <p className="text-neutral-400">No highlights available yet. Create events and add match highlights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Global Highlights</h2>
          <p className="text-neutral-400 text-sm">Latest match moments from the community</p>
        </div>
        <div className="flex space-x-2">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-amber-500 w-8' : 'bg-neutral-700 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div 
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {highlights.map((highlight, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {/* Modern Card Layout with Image Overlay */}
              <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden group">
                {/* Background Media */}
                {highlight.mediaUrl ? (
                  highlight.mediaType === 'video' ? (
                    <video
                      src={highlight.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                      poster={highlight.mediaUrl}
                      onError={(e) => {
                        console.error('Video failed to load:', highlight.mediaUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">Video not available</div>';
                      }}
                    />
                  ) : (
                    <img
                      src={highlight.mediaUrl}
                      alt={highlight.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Image failed to load:', highlight.mediaUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">Image not available</div>';
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-neutral-500">No media available</p>
                    </div>
                  </div>
                )}

                {/* Gradient Overlay - Lower gradient starting from bottom */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgb(38 38 38) 0%, rgb(38 38 38 / 0.9) 30%, rgb(38 38 38 / 0.5) 50%, transparent 70%)'
                  }}
                ></div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="max-w-3xl">
                    {/* Event Badge */}
                    {highlight.eventName && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                        <span className="text-amber-400 text-xs font-medium">{highlight.eventName}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                      {highlight.title}
                    </h3>

                    {/* Description */}
                    <p className="text-neutral-300 text-sm lg:text-base mb-4 line-clamp-2">
                      {highlight.description}
                    </p>

                    {/* Match Details */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {highlight.matchDetails?.teams && (
                        <div className="flex items-center text-sm text-neutral-300 bg-neutral-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800">
                          <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">
                            {Array.isArray(highlight.matchDetails.teams) ? 
                              highlight.matchDetails.teams.join(' vs ') : 
                              'Teams not available'
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-neutral-400 bg-neutral-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(highlight.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {highlights.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 hover:bg-amber-500 hover:border-amber-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
              aria-label="Previous highlight"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 hover:bg-amber-500 hover:border-amber-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
              aria-label="Next highlight"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalHighlightsCarousel;
