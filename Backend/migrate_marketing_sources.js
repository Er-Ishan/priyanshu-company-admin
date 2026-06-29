import db from "./config/db.js";

async function migrate() {
  const conn = db.promise();

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS marketing_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_company_slug (company_id, slug),
        KEY idx_company_active (company_id, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ marketing_sources table ready.");

    const [bookingCols] = await conn.query(
      "SHOW COLUMNS FROM parking_bookings LIKE 'marketing_source'"
    );
    if (bookingCols.length === 0) {
      await conn.query(`
        ALTER TABLE parking_bookings
        ADD COLUMN marketing_source VARCHAR(50) DEFAULT NULL
        AFTER source
      `);
      console.log("✅ Added marketing_source column to parking_bookings.");
    } else {
      console.log("ℹ️ marketing_source column already exists on parking_bookings.");
    }

    const [msCols] = await conn.query(
      "SHOW COLUMNS FROM marketing_sources LIKE 'media_source_id'"
    );
    if (msCols.length === 0) {
      await conn.query(`
        ALTER TABLE marketing_sources
        ADD COLUMN media_source_id INT DEFAULT NULL
        AFTER company_id
      `);
      console.log("✅ Added media_source_id column to marketing_sources.");
    }

    const [slugUnique] = await conn.query(
      "SHOW INDEX FROM marketing_sources WHERE Key_name = 'uq_company_slug'"
    );
    if (slugUnique.length > 0) {
      await conn.query("ALTER TABLE marketing_sources DROP INDEX uq_company_slug");
      console.log("✅ Removed uq_company_slug so multiple links per media source are allowed.");
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

migrate();
