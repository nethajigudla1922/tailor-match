const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  console.log('Connecting to database at:', dbPath);
  const db = new Database(dbPath);

  const columns = ['neck', 'chest', 'waist', 'hips', 'inseam', 'sleeve', 'shoulder'];
  
  for (const col of columns) {
    try {
      db.prepare(`ALTER TABLE Booking ADD COLUMN ${col} REAL`).run();
      console.log(`Successfully added column: ${col}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`Column ${col} already exists, skipping.`);
      } else {
        throw e;
      }
    }
  }

  console.log('Migration completed successfully!');
  db.close();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
