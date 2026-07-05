import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomBase32Secret() {
  const bytes = randomBytes(20);
  let bits = "";
  bytes.forEach((byte) => {
    bits += byte.toString(2).padStart(8, "0");
  });
  return bits.match(/.{1,5}/g)?.map((chunk) => base32Alphabet[parseInt(chunk.padEnd(5, "0"), 2)]).join("") ?? "";
}

function decodeBase32(secret) {
  const cleaned = secret.replace(/=+$/g, "").replace(/\s/g, "").toUpperCase();
  let bits = "";
  for (const char of cleaned) {
    const value = base32Alphabet.indexOf(char);
    if (value >= 0) bits += value.toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{1,8}/g)?.filter((chunk) => chunk.length === 8).map((chunk) => parseInt(chunk, 2)) ?? [];
  return Buffer.from(bytes);
}

function generateTotp(secret, timestep = Math.floor(Date.now() / 30000)) {
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(timestep, 4);
  const hash = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = hash[hash.length - 1] & 0xf;
  const binary = ((hash[offset] & 0x7f) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
  return String(binary % 1000000).padStart(6, "0");
}

export function verifyTotp(secret, code) {
  const cleanCode = String(code ?? "").replace(/\D/g, "");
  if (cleanCode.length !== 6) return false;
  const received = Buffer.from(cleanCode);
  const timestep = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((offset) => {
    const expected = Buffer.from(generateTotp(secret, timestep + offset));
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
}
