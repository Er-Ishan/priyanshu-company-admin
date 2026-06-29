import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ALGORITHM = "aes-256-cbc";

function getKey() {
  const secret =
    process.env.BOOKING_SYNC_SECRET ||
    process.env.ENCRYPTION_KEY ||
    process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "BOOKING_SYNC_SECRET (or ENCRYPTION_KEY) is not configured"
    );
  }

  return crypto.createHash("sha256").update(String(secret)).digest();
}

/**
 * Decrypts a value produced by encryptParam.
 * Expected format: "<iv-hex>:<ciphertext-hex>"
 */
export function decryptParam(encryptedValue) {
  if (!encryptedValue) {
    throw new Error("Missing encrypted value");
  }

  const decoded = decodeURIComponent(String(encryptedValue).trim());
  const parts = decoded.split(":");

  if (parts.length !== 2) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Encrypts a plain value for use in sync URLs.
 */
export function encryptParam(plainValue) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(String(plainValue), "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}
