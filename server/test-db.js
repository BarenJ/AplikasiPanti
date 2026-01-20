// server/test-db.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function testDatabase() {
  const dbPath = path.join(__dirname, 'nursing_home.db');
  console.log(`Testing database at: ${dbPath}`);
  
  if (!require('fs').existsSync(dbPath)) {
    console.error('❌ Database file does not exist!');
    return;
  }

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Database connection successful');
    
    // Test residents table
    console.log('\n🧪 Testing residents table:');
    try {
      const residents = await db.all('SELECT id, name FROM residents LIMIT 5');
      console.log(`Found ${residents.length} residents:`);
      residents.forEach(r => console.log(`  - ID: ${r.id}, Name: ${r.name}`));
    } catch (error) {
      console.error('❌ Error querying residents:', error.message);
    }

    // Test table structure
    console.log('\n🔍 Checking table structure:');
    try {
      const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Tables found:', tables.map(t => t.name).join(', '));
      
      // Check residents table columns
      const residentColumns = await db.all('PRAGMA table_info(residents)');
      console.log('\nResidents table columns:');
      residentColumns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
      });
    } catch (error) {
      console.error('❌ Error checking table structure:', error.message);
    }

    // Test a specific query that might be failing
    console.log('\n🧪 Testing specific query for resident ID 1:');
    try {
      const resident = await db.get('SELECT * FROM residents WHERE id = 1');
      if (resident) {
        console.log('✅ Found resident ID 1:', resident.name);
        
        // Check for problematic columns
        const requiredColumns = ['functional_walking', 'functional_eating', 'mental_emotion', 'mental_consciousness'];
        for (const col of requiredColumns) {
          console.log(`  ${col}: ${resident[col] || 'NULL/MISSING'}`);
        }
      } else {
        console.log('❌ No resident found with ID 1');
      }
    } catch (error) {
      console.error('❌ Error testing query:', error.message);
      console.error('Full error:', error);
    }

    await db.close();
    console.log('\n✅ Database test completed');

  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('Full error:', error);
  }
}

testDatabase();