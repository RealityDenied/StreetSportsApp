// API Test Script for Event Highlights and Audience System
// Run this in browser console or as a test script

const API_BASE = 'http://localhost:5000/api'; // Adjust based on your backend URL

// Test data
const testEventId = 'YOUR_EVENT_ID_HERE';
const testMatchId = 'YOUR_MATCH_ID_HERE';
const testUserId = 'YOUR_USER_ID_HERE';

// Helper function to make API calls
async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust token retrieval
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, response.status, result);
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error);
    return { error };
  }
}

// Test functions
async function testAudienceEndpoints() {
  console.log('=== Testing Audience Endpoints ===');
  
  // Test join audience
  await testAPI(`/events/${testEventId}/audience/join`, 'POST');
  
  // Test get audience
  await testAPI(`/events/${testEventId}/audience`);
  
  // Test remove from audience (organizer only)
  await testAPI(`/events/${testEventId}/audience/${testUserId}`, 'DELETE');
}

async function testPlayerEndpoints() {
  console.log('=== Testing Player Application Endpoints ===');
  
  // Test apply as player
  await testAPI(`/events/${testEventId}/players/apply`, 'POST');
  
  // Test apply to team
  await testAPI(`/events/${testEventId}/players/apply-to-team/TEAM_ID`, 'POST');
  
  // Test get pending players
  await testAPI(`/events/${testEventId}/players/pending`);
  
  // Test approve player
  await testAPI(`/events/${testEventId}/players/${testUserId}/approve`, 'POST', { teamId: 'TEAM_ID' });
  
  // Test reject player
  await testAPI(`/events/${testEventId}/players/${testUserId}/reject`, 'DELETE');
}

async function testHighlightEndpoints() {
  console.log('=== Testing Highlight Endpoints ===');
  
  // Test get match highlights
  await testAPI(`/events/${testEventId}/matches/${testMatchId}/highlights`);
  
  // Test create highlight (requires file upload)
  const formData = new FormData();
  formData.append('title', 'Test Highlight');
  formData.append('description', 'Test description');
  formData.append('mediaType', 'photo');
  // formData.append('media', file); // Add actual file
  
  // Note: This would need to be tested with actual file upload
  console.log('Create highlight test requires actual file upload');
  
  // Test delete highlight
  await testAPI(`/events/${testEventId}/matches/${testMatchId}/highlights/HIGHLIGHT_ID`, 'DELETE');
}

async function testEventCreation() {
  console.log('=== Testing Event Creation ===');
  
  const eventData = {
    eventName: 'Test Event with Highlights',
    sportType: 'Football',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration: 3,
    audienceFree: true,
    playerFree: false,
    audienceFee: 0,
    playerFee: 50
  };
  
  await testAPI('/events/create', 'POST', eventData);
}

// Run all tests
async function runAllTests() {
  console.log('Starting API Tests for Event Highlights and Audience System...');
  
  await testEventCreation();
  await testAudienceEndpoints();
  await testPlayerEndpoints();
  await testHighlightEndpoints();
  
  console.log('All tests completed!');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testAPI,
    testAudienceEndpoints,
    testPlayerEndpoints,
    testHighlightEndpoints,
    testEventCreation,
    runAllTests
  };
}

// Usage instructions
console.log(`
API Test Script for Event Highlights and Audience System

To use this script:

1. Update the test IDs at the top of the file:
   - testEventId: Replace with actual event ID
   - testMatchId: Replace with actual match ID  
   - testUserId: Replace with actual user ID

2. Ensure you have a valid authentication token in localStorage

3. Run the tests:
   - runAllTests() - Run all tests
   - testAudienceEndpoints() - Test audience functionality
   - testPlayerEndpoints() - Test player application functionality
   - testHighlightEndpoints() - Test highlight functionality
   - testEventCreation() - Test event creation with new fields

4. Check console output for results

Note: Some tests require actual data and file uploads to work properly.
`);

// Uncomment to run tests automatically (after updating IDs)
// runAllTests();
