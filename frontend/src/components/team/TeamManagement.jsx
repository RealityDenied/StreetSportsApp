import { useState, useEffect } from 'react';
import api from '../../api/api';

const TeamManagement = ({ event, isOrganizer, onTeamCreated }) => {
  const [teams, setTeams] = useState([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    // View-only mode for non-organizers
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Teams ({teams.length})</h3>
        
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No teams created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, index) => (
              <div key={team._id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{team.teamName}</h4>
                <p className="text-sm text-gray-600 mb-2">Members: {team.users?.length || 0}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Played: {team.matchesPlayed || 0}</span>
                  <span>Won: {team.matchesWon || 0}</span>
                </div>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <TeamCard key={team._id || index} team={team} eventId={event._id} />
          ))}
        </div>
      )}
    </div>
  );
};

const TeamCard = ({ team, eventId }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      console.log('Searching users with:', { query, eventId, teamId: team._id });
      const response = await api.get(`/requests/search-users?q=${encodeURIComponent(query)}&eventId=${eventId}&teamId=${team._id}`);
      console.log('Search response:', response.data);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      console.error('Error response:', error.response?.data);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      console.log('Inviting user:', { userId, eventId, teamId: team._id });
      const response = await api.post(`/events/${eventId}/teams/${team._id}/invite`, {
        receiverId: userId,
        message: `You've been invited to join team "${team.teamName}"`
      });
      
      console.log('Invite response:', response.data);
      alert('Invitation sent successfully!');
      setSearchQuery('');
      setSearchResults([]);
      setShowAddMember(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      console.error('Invite error response:', error.response?.data);
      alert('Error sending invitation. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{team.teamName}</h4>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Add Member
        </button>
      </div>

      {/* Add Member Search */}
      {showAddMember && (
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearchUsers(e.target.value);
            }}
            placeholder="Search users..."
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {searching && (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleInviteUser(user._id)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.favoriteSport} • {user.city}</p>
                  </div>
                  <span className="text-xs text-blue-600">Invite</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Stats */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Members: {team.users?.length || 0}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>Played: {team.matchesPlayed || 0}</span>
          <span>Won: {team.matchesWon || 0}</span>
          <span>Pending: {team.matchesResultPending || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
