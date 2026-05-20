const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  console.log('Connecting to database at:', dbPath);
  const db = new Database(dbPath);

  // 1. Rename old table if it exists
  db.prepare(`ALTER TABLE Measurement RENAME TO OldMeasurement`).run();
  console.log('Renamed old Measurement table.');

  // 2. Create the new Measurement table (no @unique constraint on customerProfileId, and with name)
  db.prepare(`
    CREATE TABLE "Measurement" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerProfileId" TEXT NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'Default Fit',
      "neck" REAL,
      "chest" REAL,
      "waist" REAL,
      "hips" REAL,
      "inseam" REAL,
      "sleeve" REAL,
      "shoulder" REAL,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Measurement_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `).run();
  console.log('Created new Measurement table.');

  // 3. Copy any existing data from OldMeasurement if there was any
  try {
    db.prepare(`
      INSERT INTO "Measurement" ("id", "customerProfileId", "name", "neck", "chest", "waist", "hips", "inseam", "sleeve", "shoulder", "updatedAt")
      SELECT "id", "customerProfileId", 'Default Fit', "neck", "chest", "waist", "hips", "inseam", "sleeve", "shoulder", "updatedAt"
      FROM "OldMeasurement"
    `).run();
    console.log('Migrated old measurements to new table.');
  } catch (copyErr) {
    console.log('No old data migrated or table empty:', copyErr.message);
  }

  // 4. Drop the old table
  db.prepare(`DROP TABLE IF EXISTS "OldMeasurement"`).run();
  console.log('Dropped OldMeasurement table.');

  console.log('Migration completed successfully!');
  db.close();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
