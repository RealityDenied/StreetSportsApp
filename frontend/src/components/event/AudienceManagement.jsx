import { useState, useEffect } from 'react';
import api from '../../api/api';

const AudienceManagement = ({ eventId, audience, isOrganizer, onAudienceUpdated }) => {
  const [audienceMembers, setAudienceMembers] = useState(audience?.users || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (audience?.users) {
      setAudienceMembers(audience.users);
    }
  }, [audience]);

  const handleRemoveFromAudience = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the audience?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/events/${eventId}/audience/${userId}`);
      setAudienceMembers(prev => prev.filter(user => user._id !== userId));
      onAudienceUpdated && onAudienceUpdated();
      alert('User removed from audience successfully');
    } catch (error) {
      console.error('Error removing user from audience:', error);
      alert('Error removing user from audience');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    // View-only mode for non-organizers
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Audience ({audienceMembers.length})
        </h3>
        
        {audienceMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No audience members yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audienceMembers.map((member) => (
              <div key={member._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {member.favoriteSport && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {member.favoriteSport}
                    </span>
                  )}
                  {member.city && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {member.city}
                    </span>
                  )}
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
        <h3 className="text-xl font-semibold text-gray-900">
          Audience Management ({audienceMembers.length})
        </h3>
      </div>
      
      {audienceMembers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-500">No audience members yet</p>
          <p className="text-sm text-gray-400 mt-2">Share the event link to get audience members!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audienceMembers.map((member) => (
            <div key={member._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {member.favoriteSport && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {member.favoriteSport}
                      </span>
                    )}
                    {member.city && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {member.city}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveFromAudience(member._id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-2 hover:bg-red-50 rounded"
                  title="Remove from audience"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudienceManagement;
