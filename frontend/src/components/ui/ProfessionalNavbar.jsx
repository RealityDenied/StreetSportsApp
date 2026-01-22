import { useState, useRef, useEffect } from 'react';
import SettingsDropdown from './SettingsDropdown';

const ProfessionalNavbar = ({ user, onLogout, onScrollToSection }) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || '',
    favoriteSport: user?.favoriteSport || ''
  });
  const profileRef = useRef(null);

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfilePopup(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          city: profileData.city,
          favoriteSport: profileData.favoriteSport
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setIsEditing(false);
        setShowProfilePopup(false);
        console.log('Profile updated successfully:', result.user);
        alert('Profile updated successfully!');
      } else {
        console.error('Profile update failed:', result.message);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleNavClick = (section) => {
    onScrollToSection(section);
    setShowProfilePopup(false);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-900 border-b border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base">SS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white text-lg font-semibold">StreetSports</h1>
              <p className="text-neutral-500 text-xs">Your Sports Hub</p>
            </div>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            <button
              onClick={() => handleNavClick('highlights')}
              className="px-4 py-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-900 rounded-lg font-medium transition-all duration-200"
              aria-label="View highlights"
            >
              Highlights
            </button>
            <button
              onClick={() => handleNavClick('statistics')}
              className="px-4 py-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-900 rounded-lg font-medium transition-all duration-200"
              aria-label="View statistics"
            >
              Statistics
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className="px-4 py-2 text-neutral-400 hover:text-amber-500 hover:bg-neutral-900 rounded-lg font-medium transition-all duration-200"
              aria-label="View events"
            >
              Events
            </button>
          </nav>

          {/* Right Section - Profile & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-900 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Profile Button - Golden Ratio Design */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                  showProfilePopup 
                    ? 'bg-neutral-800 border border-amber-500/30 shadow-lg shadow-amber-500/10' 
                    : 'hover:bg-neutral-800 border border-transparent'
                }`}
                aria-label="User profile menu"
                aria-expanded={showProfilePopup}
              >
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-amber-500/20">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-950"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-white font-semibold text-sm leading-tight">{user?.name || 'User'}</div>
                  <div className="text-neutral-400 text-xs leading-tight">{user?.city || 'Location'}</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${showProfilePopup ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Popup - Golden Ratio Proportions (width:height ≈ 1.618) */}
              {showProfilePopup && (
                <div className="absolute right-0 mt-3 w-[360px] bg-neutral-800 rounded-3xl shadow-2xl border border-neutral-700 overflow-hidden backdrop-blur-xl">
                  {/* Header Section with Golden Ratio */}
                  <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-900 border-b border-neutral-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-amber-500/20">
                          <span className="text-white font-bold text-xl">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-0.5">{user?.name || 'User'}</h3>
                        <p className="text-neutral-400 text-xs">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                  </div>
                  
                  <div className="px-6 py-5 space-y-4 max-h-[400px] overflow-y-auto">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">City</label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Favorite Sport</label>
                          <select
                            value={profileData.favoriteSport}
                            onChange={(e) => setProfileData({...profileData, favoriteSport: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                          >
                            <option value="">Select Sport</option>
                            <option value="Cricket">Cricket</option>
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Badminton">Badminton</option>
                            <option value="Volleyball">Volleyball</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleProfileUpdate}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-semibold text-sm shadow-lg shadow-amber-500/20"
                            style={{ aspectRatio: '2.618 / 1' }}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setProfileData({
                                name: user?.name || '',
                                email: user?.email || '',
                                city: user?.city || '',
                                favoriteSport: user?.favoriteSport || ''
                              });
                            }}
                            className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-white rounded-xl hover:bg-neutral-700 transition-all duration-200 font-medium text-sm"
                            style={{ aspectRatio: '2.618 / 1' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Name</div>
                                <div className="text-sm font-semibold text-white">{user?.name || 'Not set'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Email</div>
                                <div className="text-sm font-semibold text-white truncate max-w-[200px]">{user?.email || 'Not set'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">City</div>
                                <div className="text-sm font-semibold text-white">{user?.city || 'Not set'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Favorite Sport</div>
                                <div className="text-sm font-semibold text-white">{user?.favoriteSport || 'Not set'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-semibold text-sm shadow-lg shadow-amber-500/20"
                          style={{ aspectRatio: '2.618 / 1' }}
                        >
                          Edit Profile
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="px-6 py-4 border-t border-neutral-700 bg-neutral-900/50">
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-800">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => handleNavClick('highlights')}
              className="block w-full text-left px-4 py-3 text-neutral-300 hover:text-amber-500 hover:bg-neutral-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Highlights
            </button>
            <button
              onClick={() => handleNavClick('statistics')}
              className="block w-full text-left px-4 py-3 text-neutral-300 hover:text-amber-500 hover:bg-neutral-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Statistics
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className="block w-full text-left px-4 py-3 text-neutral-300 hover:text-amber-500 hover:bg-neutral-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Events
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ProfessionalNavbar;
