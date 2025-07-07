import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Handle both formats: "hash.salt" and "salt:hash"
  let salt: string, hashed: string;
  
  if (stored.includes(".")) {
    // Format: "hash.salt"
    [hashed, salt] = stored.split(".");
  } else if (stored.includes(":")) {
    // Format: "salt:hash"
    [salt, hashed] = stored.split(":");
  } else {
    throw new Error("Invalid stored password format");
  }
  
  if (!salt || !hashed) {
    throw new Error("Invalid stored password format - missing salt or hash");
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}