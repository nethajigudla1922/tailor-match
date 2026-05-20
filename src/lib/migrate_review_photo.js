const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  console.log('Connecting to database at:', dbPath);
  const db = new Database(dbPath);

  // Check if image column already exists in Review
  const tableInfo = db.prepare("PRAGMA table_info(Review)").all();
  const columnExists = tableInfo.some(col => col.name === 'image');

  if (!columnExists) {
    db.prepare('ALTER TABLE "Review" ADD COLUMN "image" TEXT').run();
    console.log('Successfully added image column to Review table!');
  } else {
    console.log('image column already exists in Review, skipping.');
  }

  db.close();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
