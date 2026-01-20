const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test /api/test
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ /api/test:', testResponse.data.message);
    
    // Test /api/activity-types
    const activityTypes = await axios.get('http://localhost:5000/api/activity-types');
    console.log(`✅ /api/activity-types: ${activityTypes.data.length} types`);
    
    // Test /api/residents
    const residents = await axios.get('http://localhost:5000/api/residents');
    console.log(`✅ /api/residents: ${residents.data.length} residents`);
    
    // Test /api/records
    try {
      const records = await axios.get('http://localhost:5000/api/records');
      console.log(`✅ /api/records: ${records.data.length} records`);
    } catch (error) {
      console.log('❌ /api/records error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoints();