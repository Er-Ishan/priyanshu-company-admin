/**
 * Add access_social_media_report permission without wiping existing role_permissions.
 * Run: node Backend/migrate_social_media_report_permission.js
 */
import db from "./config/db.js";

async function migrate() {
  const conn = db.promise();
  try {
    const [existing] = await conn.query(
      "SELECT id FROM permissions WHERE name = 'access_social_media_report' LIMIT 1"
    );
    if (existing.length) {
      console.log("✅ access_social_media_report permission already exists.");
      return;
    }

    const [result] = await conn.query(
      `INSERT INTO permissions (name, description, module)
       VALUES (?, ?, ?)`,
      [
        "access_social_media_report",
        "Access Social Media Links Report",
        "Report",
      ]
    );
    const permId = result.insertId;
    console.log(`✅ Created permission id=${permId}`);

    const [adminRoles] = await conn.query(
      "SELECT id, company_id FROM roles WHERE LOWER(name) = 'admin'"
    );
    for (const role of adminRoles) {
      await conn.query(
        "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [role.id, permId]
      );
    }
    console.log(`✅ Granted to ${adminRoles.length} Admin role(s).`);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

migrate();