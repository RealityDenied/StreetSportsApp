import { useState, useEffect } from 'react';
import api from '../../api/api';

const TeamMemberSearch = ({ eventId, teamId, onUserSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/requests/search-users', {
        params: {
          query: searchQuery,
          eventId,
          teamId
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSendInvites = async () => {
    try {
      for (const user of selectedUsers) {
        await api.post(`/events/${eventId}/teams/${teamId}/invite`, {
          receiverId: user._id,
          message: `You've been invited to join a team!`
        });
      }
      onUserSelect(selectedUsers);
      onClose();
    } catch (error) {
      console.error('Error sending invites:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Add Team Members</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white/80 text-sm font-medium mb-2">Selected Users:</h4>
            <div className="space-y-2">
              {selectedUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/60 text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleUserRemove(user._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            </div>
          ) : users.length === 0 && searchQuery.length > 2 ? (
            <div className="text-center py-4">
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            users.map(user => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-white/60 text-sm">{user.email}</p>
                  <p className="text-white/40 text-xs">{user.city} • {user.favoriteSport}</p>
                </div>
                <button className="text-blue-400 hover:text-blue-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSendInvites}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Send Invites ({selectedUsers.length})
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberSearch;
