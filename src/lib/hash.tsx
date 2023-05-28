import crypto from "crypto";

function generateSHA1Hash(input: string): string {
  const hash = crypto.createHash("sha1");
  hash.update(input);
  return hash.digest("hex");
}
