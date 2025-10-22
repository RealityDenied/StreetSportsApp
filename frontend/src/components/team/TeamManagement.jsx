import { useState, useEffect } from 'react';
import api from '../../api/api';
import Toast from '../ui/Toast';

const TeamManagement = ({ event, isOrganizer, onTeamCreated }) => {
  const [teams, setTeams] = useState([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (event && event.teams) {
      setTeams(event.teams);
    }
  }, [event]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/events/${event._id}/teams/create`, {
        teamName: newTeamName.trim()
      });
      
      setTeams(prev => [...prev, response.data.team]);
      setNewTeamName('');
      setShowCreateTeam(false);
      onTeamCreated && onTeamCreated(response.data.team);
      showToast('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      showToast('Error creating team. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    // View-only mode for non-organizers - show team details but no management controls
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Teams ({teams.length})</h3>
        
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No teams created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team, index) => (
              <TeamCard key={team._id || index} team={team} eventId={event._id} isOrganizer={false} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Teams ({teams.length})</h3>
        <button
          onClick={() => setShowCreateTeam(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create Team
        </button>
      </div>

      {/* Create Team Form */}
      {showCreateTeam && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <form onSubmit={handleCreateTeam} className="flex items-center space-x-3">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name..."
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateTeam(false);
                setNewTeamName('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Teams List */}
      {teams.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No teams created yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team, index) => (
            <TeamCard key={team._id || index} team={team} eventId={event._id} isOrganizer={isOrganizer} />
          ))}
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
};

const TeamCard = ({ team, eventId, isOrganizer }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (team.users) {
      setTeamMembers(team.users);
    }
  }, [team.users]);

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/requests/search-users?q=${encodeURIComponent(query)}&eventId=${eventId}&teamId=${team._id}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      await api.post(`/events/${eventId}/teams/${team._id}/invite`, {
        receiverId: userId,
        message: `You've been invited to join team "${team.teamName}"`
      });
      
      showToast('Invitation sent successfully!');
      setSearchQuery('');
      setSearchResults([]);
      setShowAddMember(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.message || 'Error sending invitation. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team?`)) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}/teams/${team._id}/members/${userId}`);
      
      // Update local state
      setTeamMembers(prev => prev.filter(member => member._id !== userId));
      showToast('Member removed successfully!');
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMessage = error.response?.data?.message || 'Error removing member. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handlePromoteToCaptain = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to promote ${memberName} to captain?`)) {
      return;
    }

    try {
      await api.put(`/events/${eventId}/teams/${team._id}/members/${userId}/promote`);
      
      // Update local state - move promoted member to first position
      setTeamMembers(prev => {
        const member = prev.find(m => m._id === userId);
        const otherMembers = prev.filter(m => m._id !== userId);
        return [member, ...otherMembers];
      });
      
      showToast(`${memberName} has been promoted to captain!`);
    } catch (error) {
      console.error('Error promoting member:', error);
      const errorMessage = error.response?.data?.message || 'Error promoting member. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const displayMembers = showAllMembers ? teamMembers : teamMembers.slice(0, 3);
  const hasMoreMembers = teamMembers.length > 3;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Team Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{team.teamName}</h4>
          <p className="text-sm text-gray-500">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</p>
        </div>
        {isOrganizer && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {showAddMember ? 'Cancel' : 'Add Member'}
          </button>
        )}
      </div>

      {/* Add Member Search - Only for Organizers */}
      {isOrganizer && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearchUsers(e.target.value);
            }}
            placeholder="Search users to invite..."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleInviteUser(user._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.favoriteSport} • {user.city}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Invite</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Team Members</h5>
        
        {teamMembers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No members yet</p>
            <p className="text-xs">Invite users to join this team</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayMembers.map((member, index) => (
              <div key={member._id || index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">
                    {member.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{member.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {index === 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Captain</span>
                  )}
                  {isOrganizer && (
                    <>
                      <button
                        onClick={() => handlePromoteToCaptain(member._id, member.name)}
                        className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Promote to Captain"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member._id, member.name)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove Member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {hasMoreMembers && (
              <button
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllMembers ? 'Show Less' : `Show ${teamMembers.length - 3} More`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-blue-600">{team.matchesPlayed || 0}</p>
            <p className="text-xs text-gray-500">Played</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">{team.matchesWon || 0}</p>
            <p className="text-xs text-gray-500">Won</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-orange-600">{team.matchesResultPending || 0}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
      </div>
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default TeamManagement;
