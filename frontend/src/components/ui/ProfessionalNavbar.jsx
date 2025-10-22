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
      const response = await fetch('http://localhost:5000/api/user/profile', {
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">SS</span>
            </div>
            <h1 className="text-gray-900 text-sm sm:text-xl font-bold truncate">Street Sports INC</h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('highlights')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Highlights
            </button>
            <button
              onClick={() => handleNavClick('statistics')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Statistics
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Events
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Profile Button */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-gray-700 font-medium">
                  {user?.name || 'User'}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Popup */}
              {showProfilePopup && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-4">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  </div>
                  
                  <div className="px-4 py-3 space-y-3">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Sport</label>
                          <select
                            value={profileData.favoriteSport}
                            onChange={(e) => setProfileData({...profileData, favoriteSport: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={handleProfileUpdate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Save
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
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Name:</span>
                            <span className="text-sm font-medium text-gray-900">{user?.name || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Email:</span>
                            <span className="text-sm font-medium text-gray-900">{user?.email || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">City:</span>
                            <span className="text-sm font-medium text-gray-900">{user?.city || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Favorite Sport:</span>
                            <span className="text-sm font-medium text-gray-900">{user?.favoriteSport || 'Not set'}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="px-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Sign Out
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
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => handleNavClick('highlights')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Highlights
            </button>
            <button
              onClick={() => handleNavClick('statistics')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Statistics
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
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
