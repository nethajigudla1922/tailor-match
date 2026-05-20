const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  console.log('Connecting to database at:', dbPath);
  const db = new Database(dbPath);

  // Check if profilePicture column already exists
  const tableInfo = db.prepare("PRAGMA table_info(TailorProfile)").all();
  const columnExists = tableInfo.some(col => col.name === 'profilePicture');

  if (!columnExists) {
    db.prepare('ALTER TABLE "TailorProfile" ADD COLUMN "profilePicture" TEXT').run();
    console.log('Successfully added profilePicture column to TailorProfile table!');
  } else {
    console.log('profilePicture column already exists, skipping.');
  }

  db.close();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
