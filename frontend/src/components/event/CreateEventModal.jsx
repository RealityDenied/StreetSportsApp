import { useState } from 'react';
import api from '../../api/api';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState({
    eventName: '',
    sportType: '',
    startDate: '',
    registrationDeadline: '',
    duration: '',
    audienceFree: true,
    playerFree: true,
    audienceFee: 0,
    playerFee: 0
  });
  const [loading, setLoading] = useState(false);

  const sportTypes = [
    'Cricket', 'Football', 'Basketball', 'Tennis', 
    'Volleyball', 'Badminton', 'Table Tennis', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!eventData.eventName || !eventData.sportType || !eventData.startDate || !eventData.registrationDeadline || !eventData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/events/create', eventData);
      const event = response.data.event;
      
      // Generate shareable link
      const eventLink = `${window.location.origin}/event/${event._id}`;
      
      alert(`Event created successfully! Share this link: ${eventLink}`);
      
      onEventCreated && onEventCreated(event);
      onClose();
      
      // Reset form
      setEventData({
        eventName: '',
        sportType: '',
        startDate: '',
        registrationDeadline: '',
        duration: '',
        audienceFree: true,
        playerFree: true,
        audienceFee: 0,
        playerFee: 0
      });
      setStep(1);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && eventData.eventName && eventData.sportType) {
      setStep(2);
    } else if (step === 2 && eventData.startDate && eventData.registrationDeadline && eventData.duration) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 text-xl font-bold">Create New Event</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventData.eventName}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  placeholder="Enter event name..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Sport Type *
                </label>
                <select
                  value={eventData.sportType}
                  onChange={(e) => handleInputChange('sportType', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-gray-50 text-gray-900">Select sport type...</option>
                  {sportTypes.map(sport => (
                    <option key={sport} value={sport} className="bg-gray-50 text-gray-900">{sport}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!eventData.eventName || !eventData.sportType}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Event Dates & Duration */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Event Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={eventData.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Event Duration (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={eventData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                  placeholder="Enter duration in days..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!eventData.startDate || !eventData.registrationDeadline || !eventData.duration}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Fees & Settings */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Audience Settings */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="audienceFree"
                      checked={eventData.audienceFree}
                      onChange={(e) => handleInputChange('audienceFree', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="audienceFree" className="text-gray-700 font-medium">
                      Free for audience
                    </label>
                  </div>
                  {!eventData.audienceFree && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Audience Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={eventData.audienceFee}
                        onChange={(e) => handleInputChange('audienceFee', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Player Settings */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="playerFree"
                      checked={eventData.playerFree}
                      onChange={(e) => handleInputChange('playerFree', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="playerFree" className="text-gray-700 font-medium">
                      Free for players
                    </label>
                  </div>
                  {!eventData.playerFree && (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Player Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={eventData.playerFee}
                        onChange={(e) => handleInputChange('playerFee', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateEventModal;