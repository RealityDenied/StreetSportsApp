import { useState, useEffect } from 'react';
import api from '../../api/api';
import Toast from '../ui/Toast';

const MatchManagement = ({ event, isOrganizer, onMatchCreated }) => {
  const [matches, setMatches] = useState([]);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (event && event.matches) {
      setMatches(event.matches);
    }
  }, [event]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (selectedTeams.length !== 2) {
      showToast('Please select exactly 2 teams', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/events/${event._id}/matches/create`, {
        teams: selectedTeams
      });
      
      setMatches(prev => [...prev, response.data.match]);
      setSelectedTeams([]);
      setShowCreateMatch(false);
      onMatchCreated && onMatchCreated(response.data.match);
      showToast('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      showToast('Error creating match. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(prev => prev.filter(id => id !== teamId));
    } else if (selectedTeams.length < 2) {
      setSelectedTeams(prev => [...prev, teamId]);
    } else {
      showToast('You can only select 2 teams for a match', 'error');
    }
  };

  if (!isOrganizer) {
    // View-only mode for non-organizers
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Matches ({matches.length})</h3>
        
        {matches.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No matches scheduled yet</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match, index) => (
              <MatchCard key={match._id || index} match={match} teams={event.teams} isOrganizer={false} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Matches ({matches.length})</h3>
        <button
          onClick={() => setShowCreateMatch(true)}
          disabled={event.teams?.length < 2}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create Match
        </button>
      </div>

      {event.teams?.length < 2 && (
        <p className="text-gray-500 text-sm mb-4">You need at least 2 teams to create a match</p>
      )}

      {/* Create Match Form */}
      {showCreateMatch && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Select 2 Teams for Match</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {event.teams?.map((team) => (
              <div
                key={team._id}
                onClick={() => handleTeamSelect(team._id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTeams.includes(team._id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{team.teamName}</p>
                <p className="text-sm text-gray-500">Members: {team.users?.length || 0}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateMatch}
              disabled={loading || selectedTeams.length !== 2}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </button>
            <button
              onClick={() => {
                setShowCreateMatch(false);
                setSelectedTeams([]);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No matches scheduled yet</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard key={match._id || index} match={match} teams={event.teams} isOrganizer={isOrganizer} eventId={event._id} />
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

const MatchCard = ({ match, teams, isOrganizer, eventId }) => {
  const [showUpdateResult, setShowUpdateResult] = useState(false);
  const [winningTeam, setWinningTeam] = useState('');
  const [score, setScore] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getTeamName = (teamId) => {
    const team = teams?.find(t => t._id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    if (!winningTeam) {
      showToast('Please select a winning team', 'error');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/events/${eventId}/matches/${match._id}/result`, {
        wonTeamId: winningTeam,
        score: score || undefined
      });
      
      setShowUpdateResult(false);
      setWinningTeam('');
      setScore('');
      showToast('Match result updated successfully!');
    } catch (error) {
      console.error('Error updating match result:', error);
      showToast('Error updating match result. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">
          {getTeamName(match.teams[0])} vs {getTeamName(match.teams[1])}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          match.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {match.status}
        </span>
      </div>

      {match.status === 'completed' && match.won && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-green-600">Winner:</span> {getTeamName(match.won)}
          </p>
          {match.score && (
            <p className="text-sm text-gray-600">Score: {match.score}</p>
          )}
        </div>
      )}

      {isOrganizer && match.status === 'pending' && (
        <div>
          {!showUpdateResult ? (
            <button
              onClick={() => setShowUpdateResult(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Update Result
            </button>
          ) : (
            <form onSubmit={handleUpdateResult} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Winning Team</label>
                <select
                  value={winningTeam}
                  onChange={(e) => setWinningTeam(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select winning team...</option>
                  {match.teams.map(teamId => (
                    <option key={teamId} value={teamId}>
                      {getTeamName(teamId)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (Optional)</label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g., 2-1, 15-12"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateResult(false);
                    setWinningTeam('');
                    setScore('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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

export default MatchManagement;
