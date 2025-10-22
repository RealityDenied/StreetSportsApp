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
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Filter by Sport</h2>
        <div className="flex space-x-2">
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
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                selectedSport === sport.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="mr-2 text-lg">{sport.icon}</span>
              {sport.name}
            </button>
          ))}
        </div>

        {/* Gradient overlays for better UX */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Clear filter button */}
      {selectedSport !== 'all' && (
        <div className="mt-4 text-center">
          <button
            onClick={() => handleSportSelect('all')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default SportsCategories;
