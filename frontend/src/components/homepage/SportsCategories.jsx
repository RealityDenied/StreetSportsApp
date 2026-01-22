import { useState, useRef } from 'react';

const SportsCategories = ({ onFilterChange, selectedSport }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sports = [
    { id: 'all', name: 'All Sports', icon: '🏆' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'table-tennis', name: 'Table Tennis', icon: '🏓' },
    { id: 'hockey', name: 'Hockey', icon: '🏑' },
    { id: 'baseball', name: 'Baseball', icon: '⚾' },
    { id: 'rugby', name: 'Rugby', icon: '🏉' },
    { id: 'golf', name: 'Golf', icon: '⛳' }
  ];

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
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const handleSportSelect = (sportId) => {
    onFilterChange(sportId);
  };

  return (
    <div className="py-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Filter by Sport</h2>
          <p className="text-neutral-400 text-xs">Select a sport to filter events</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canScrollLeft 
                ? 'bg-neutral-800 border border-neutral-700 hover:bg-amber-500 hover:border-amber-500 text-white' 
                : 'bg-neutral-800 border border-neutral-700 text-neutral-600 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
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
                ? 'bg-neutral-800 border border-neutral-700 hover:bg-amber-500 hover:border-amber-500 text-white' 
                : 'bg-neutral-800 border border-neutral-700 text-neutral-600 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScrollability}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSportSelect(sport.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                selectedSport === sport.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
              style={{ aspectRatio: '2.618 / 1' }}
            >
              <span className="mr-2 text-lg">{sport.icon}</span>
              {sport.name}
            </button>
          ))}
        </div>

        {/* Gradient overlays for better UX */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-900 to-transparent pointer-events-none" />
      </div>

      {/* Clear filter button */}
      {selectedSport !== 'all' && (
        <div className="mt-4 text-center">
          <button
            onClick={() => handleSportSelect('all')}
            className="text-sm text-neutral-400 hover:text-white font-medium transition-colors duration-200"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default SportsCategories;
