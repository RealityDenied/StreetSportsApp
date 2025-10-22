import { useState } from 'react';
import api from '../../api/api';

const PosterUpload = ({ event, isOrganizer, onPosterUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  console.log('PosterUpload - Event poster data:', event.poster);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('poster', file);

      // Get the token manually and add it to headers
      const token = localStorage.getItem('token');
      const response = await api.post(`/events/${event._id}/poster/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Upload response:', response.data);
      onPosterUpdated && onPosterUpdated(response.data.poster);
      alert('Poster uploaded successfully!');
    } catch (error) {
      console.error('Error uploading poster:', error);
      alert('Error uploading poster. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDeletePoster = async () => {
    if (!confirm('Are you sure you want to delete the poster?')) return;

    setDeleting(true);
    try {
      await api.delete(`/events/${event._id}/poster`);
      onPosterUpdated && onPosterUpdated(null);
      alert('Poster deleted successfully!');
    } catch (error) {
      console.error('Error deleting poster:', error);
      alert('Error deleting poster. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOrganizer) {
    // View-only mode for non-organizers
    return (
      <div className="relative">
        {event.poster?.url ? (
          <img
            src={event.poster.url}
            alt={`${event.eventName} poster`}
            className="w-full aspect-square object-cover rounded-xl shadow-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">No poster uploaded</p>
              <p className="text-sm text-gray-400">Organizer hasn't added a poster yet</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {event.poster?.url ? (
        <>
          <img
            src={event.poster.url}
            alt={`${event.eventName} poster`}
            className="w-full aspect-square object-cover rounded-xl shadow-lg"
            onError={(e) => {
              console.error('Image failed to load:', event.poster.url);
              console.error('Image error:', e);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', event.poster.url);
            }}
          />
          {/* Controls below the image */}
          <div className="flex items-center justify-center space-x-3">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              {uploading ? 'Uploading...' : 'Change Poster'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              onClick={handleDeletePoster}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No Event Poster</p>
            <p className="text-sm mb-4">Upload a square image (recommended)</p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors text-lg font-medium">
              {uploading ? 'Uploading...' : 'Upload Poster Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">Max file size: 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterUpload;
