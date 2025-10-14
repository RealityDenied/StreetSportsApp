import { useState } from 'react';

const QuickCreateModal = ({ isOpen, onClose, type, onSubmit, teams = [] }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    team1: '',
    team2: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'team' && formData.teamName.trim()) {
      onSubmit({ teamName: formData.teamName.trim() });
    } else if (type === 'match' && formData.team1 && formData.team2) {
      onSubmit({ team1: formData.team1, team2: formData.team2 });
    }
    setFormData({ teamName: '', team1: '', team2: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'team' ? 'Create New Team' : 'Create New Match'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {type === 'team' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                placeholder="Enter team name..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Team *
                </label>
                <select
                  value={formData.team1}
                  onChange={(e) => setFormData(prev => ({ ...prev, team1: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select first team...</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second Team *
                </label>
                <select
                  value={formData.team2}
                  onChange={(e) => setFormData(prev => ({ ...prev, team2: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select second team...</option>
                  {teams.filter(team => team._id !== formData.team1).map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {type === 'team' ? 'Create Team' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCreateModal;
