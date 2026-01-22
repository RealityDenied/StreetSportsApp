import { useState, useEffect } from 'react';
import api from '../../api/api';
import Toast from '../ui/Toast';
import HighlightCard from './HighlightCard';
import HighlightUploadModal from './HighlightUploadModal';

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
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Matches ({matches.length})</h3>
        
        {matches.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No matches scheduled yet</p>
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Matches ({matches.length})</h3>
        <button
          onClick={() => setShowCreateMatch(true)}
          disabled={event.teams?.length < 2}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/20"
        >
          Create Match
        </button>
      </div>

      {event.teams?.length < 2 && (
        <p className="text-neutral-400 text-sm mb-4">You need at least 2 teams to create a match</p>
      )}

      {/* Create Match Form */}
      {showCreateMatch && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-white mb-3">Select 2 Teams for Match</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {event.teams?.map((team) => (
              <div
                key={team._id}
                onClick={() => handleTeamSelect(team._id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTeams.includes(team._id)
                    ? 'border-amber-500 bg-amber-500/20'
                    : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                }`}
              >
                <p className="font-medium text-white">{team.teamName}</p>
                <p className="text-sm text-neutral-400">Members: {team.users?.length || 0}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateMatch}
              disabled={loading || selectedTeams.length !== 2}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </button>
            <button
              onClick={() => {
                setShowCreateMatch(false);
                setSelectedTeams([]);
              }}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <p className="text-neutral-400 text-center py-8">No matches scheduled yet</p>
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
  const [highlights, setHighlights] = useState(match.highlights || []);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

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

  const handleHighlightCreated = (highlight) => {
    setHighlights(prev => [...prev, highlight]);
  };

  const handleHighlightDeleted = (highlightId) => {
    setHighlights(prev => prev.filter(h => h._id !== highlightId));
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">
          {getTeamName(match.teams[0])} vs {getTeamName(match.teams[1])}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          match.status === 'completed' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {match.status}
        </span>
      </div>

      {match.status === 'completed' && match.won && (
        <div className="mb-3">
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-amber-400">Winner:</span> {getTeamName(match.won)}
          </p>
          {match.score && (
            <p className="text-sm text-neutral-300">Score: {match.score}</p>
          )}
        </div>
      )}

      {isOrganizer && match.status === 'pending' && (
        <div>
          {!showUpdateResult ? (
            <button
              onClick={() => setShowUpdateResult(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-amber-500/20"
            >
              Update Result
            </button>
          ) : (
            <form onSubmit={handleUpdateResult} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Winning Team</label>
                <select
                  value={winningTeam}
                  onChange={(e) => setWinningTeam(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                <label className="block text-sm font-medium text-neutral-300 mb-1">Score (Optional)</label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g., 2-1, 15-12"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-amber-500/20"
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
                  className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Highlights Section */}
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-white">
            Highlights ({highlights.length})
          </h5>
          {isOrganizer && (
            <button
              onClick={() => setShowHighlightModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center space-x-1 shadow-md shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Highlight</span>
            </button>
          )}
        </div>

        {highlights.length > 0 && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {highlights.map((highlight) => (
              <div key={highlight._id} className="flex-shrink-0 w-64">
                <HighlightCard
                  highlight={highlight}
                  isOrganizer={isOrganizer}
                  onDelete={handleHighlightDeleted}
                />
              </div>
            ))}
          </div>
        )}

        {highlights.length === 0 && (
          <p className="text-neutral-400 text-sm text-center py-4">
            No highlights added yet
          </p>
        )}
      </div>
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Highlight Upload Modal */}
      <HighlightUploadModal
        isOpen={showHighlightModal}
        onClose={() => setShowHighlightModal(false)}
        matchId={match._id}
        eventId={eventId}
        onHighlightCreated={handleHighlightCreated}
      />
    </div>
  );
};

export default MatchManagement;
