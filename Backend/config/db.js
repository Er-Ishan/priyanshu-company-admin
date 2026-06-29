import mysql from "mysql2";
import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from Backend/config/)
// dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: ["DATE", "DATETIME", "TIMESTAMP"],
});

// Test the pool connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("✅ MySQL Pool Connected...");
    connection.release();
  }
});

export default db;