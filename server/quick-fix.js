// server/quick-fix.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function quickFix() {
  const dbPath = path.join(__dirname, 'nursing_home.db');
  console.log(`Quick fixing database: ${dbPath}`);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // Add missing columns to residents table if they don't exist
    const columnsToAdd = [
      'functional_walking TEXT DEFAULT "Mandiri"',
      'functional_eating TEXT DEFAULT "Mandiri"',
      'mental_emotion TEXT DEFAULT "Stabil"',
      'mental_consciousness TEXT DEFAULT "Compos Mentis"'
    ];

    for (const columnDef of columnsToAdd) {
      const columnName = columnDef.split(' ')[0];
      try {
        await db.run(`ALTER TABLE residents ADD COLUMN ${columnDef}`);
        console.log(`✅ Added column: ${columnName}`);
        
        // Update existing records
        const defaultValue = columnDef.includes('DEFAULT') 
          ? columnDef.match(/DEFAULT "([^"]+)"/)[1]
          : 'NULL';
        
        await db.run(`UPDATE residents SET ${columnName} = ? WHERE ${columnName} IS NULL`, [defaultValue]);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️ Column already exists: ${columnName}`);
        } else {
          throw error;
        }
      }
    }

    // Create missing tables if they don't exist
    const tables = [
      `CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resident_id INTEGER NOT NULL,
        record_type TEXT NOT NULL,
        hemoglobin TEXT,
        leukocyte TEXT,
        erythrocyte TEXT,
        blood_sugar_random TEXT,
        blood_sugar_fasting TEXT,
        blood_sugar_two_hour TEXT,
        recorded_date TEXT NOT NULL,
        recorded_by TEXT DEFAULT 'system',
        FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resident_id INTEGER NOT NULL,
        medication_name TEXT NOT NULL,
        dosage TEXT,
        schedule TEXT,
        start_date TEXT,
        status TEXT DEFAULT 'Active',
        FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
      )`
    ];

    for (const tableSQL of tables) {
      try {
        await db.run(tableSQL);
        console.log('✅ Created/verified table');
      } catch (error) {
        console.error('❌ Error creating table:', error.message);
      }
    }

    console.log('🎉 Quick fix completed!');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
  } finally {
    await db.close();
  }
}

quickFix();