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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Global Highlights</h2>
          <p className="text-gray-600">No highlights available yet. Create events and add match highlights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Global Highlights</h2>
        <div className="flex space-x-2">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div 
        className="relative overflow-hidden rounded-xl"
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
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Media Section */}
                  <div className="relative h-64 lg:h-80">
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
                            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">Video not available</div>';
                          }}
                        />
                      ) : (
                        <img
                          src={highlight.mediaUrl}
                          alt={highlight.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', highlight.mediaUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">Image not available</div>';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', highlight.mediaUrl);
                          }}
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No media available
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col justify-center">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {highlight.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {highlight.description}
                      </p>
                    </div>

                    {/* Match Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {highlight.matchDetails?.date ? 
                          new Date(highlight.matchDetails.date).toLocaleDateString() : 
                          'Date not available'
                        }
                      </div>
                      {highlight.matchDetails?.teams && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {Array.isArray(highlight.matchDetails.teams) ? 
                            highlight.matchDetails.teams.join(' vs ') : 
                            'Teams not available'
                          }
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      Added {new Date(highlight.createdAt).toLocaleDateString()}
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
