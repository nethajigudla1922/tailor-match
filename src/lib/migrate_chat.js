const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  console.log('Connecting to database at:', dbPath);
  const db = new Database(dbPath);

  // Create ChatMessage table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "ChatMessage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "bookingId" TEXT NOT NULL,
      "senderRole" TEXT NOT NULL,
      "text" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ChatMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `).run();
  
  console.log('Successfully created ChatMessage table in dev.db!');
  db.close();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
