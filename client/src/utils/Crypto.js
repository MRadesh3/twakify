import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = Buffer.from(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY,
  "hex"
);
const IV_LENGTH = 16;

// Encrypt a message

export const encryptMessage = (message) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  console.log("data", encrypted);

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

// Decrypt a message

export const decryptMessage = (encryptedData, iv) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
