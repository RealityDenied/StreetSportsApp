import { useState } from 'react';
import api from '../../api/api';

const HighlightCard = ({ highlight, isOrganizer, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/events/${highlight.match}/highlights/${highlight._id}`);
      onDelete(highlight._id);
    } catch (error) {
      console.error('Error deleting highlight:', error);
      alert('Error deleting highlight. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {highlight.title}
          </h4>
          {highlight.description && (
            <p className="text-gray-600 text-sm mb-2">
              {highlight.description}
            </p>
          )}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>By {highlight.createdBy?.name}</span>
            <span>•</span>
            <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {isOrganizer && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-1"
            title="Delete highlight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Media Display */}
      <div className="w-full">
        {highlight.mediaType === 'photo' ? (
          <img
            src={highlight.media.url}
            alt={highlight.title}
            className="w-full aspect-square object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
            }}
          />
        ) : (
          <video
            src={highlight.media.url}
            controls
            className="w-full aspect-square object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          >
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              Video not available
            </div>
          </video>
        )}
      </div>
    </div>
  );
};

export default HighlightCard;
