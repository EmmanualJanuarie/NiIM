import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const distDir = join(projectRoot, "dist");
const dataDir = process.env.NIIM_DATA_DIR ?? join(__dirname, "data");
const dbPath = join(dataDir, "niim-db.json");
const port = Number(process.env.PORT ?? process.env.NIIM_BACKEND_PORT ?? 8787);
const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function ensureDb() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify({ auth: null, events: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  ensureDb();
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function randomBase32Secret() {
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

function verifyTotp(secret, code) {
  const cleanCode = String(code ?? "").replace(/\D/g, "");
  if (cleanCode.length !== 6) return false;
  const received = Buffer.from(cleanCode);
  const timestep = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((offset) => {
    const expected = Buffer.from(generateTotp(secret, timestep + offset));
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

function sendFile(res, path) {
  const extension = extname(path);
  res.writeHead(200, { "Content-Type": contentTypes[extension] ?? "application/octet-stream" });
  res.end(readFileSync(path));
}

function tryServeStatic(url, res) {
  const pathname = decodeURIComponent(url.pathname);
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(distDir, safePath);
  if (filePath.startsWith(distDir) && existsSync(filePath) && !filePath.endsWith("\\")) {
    sendFile(res, filePath);
    return true;
  }
  const fallback = join(distDir, "index.html");
  if (existsSync(fallback)) {
    sendFile(res, fallback);
    return true;
  }
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function recordEvent(db, type, deviceId) {
  db.events = [
    ...(db.events ?? []).slice(-49),
    { type, deviceId: String(deviceId ?? "").slice(0, 80), at: new Date().toISOString() },
  ];
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, {});
    return;
  }

  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const db = readDb();

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/auth/status") {
      const { deviceId } = await readBody(req);
      const registered = Boolean(db.auth?.deviceId);
      sendJson(res, 200, {
        registered,
        thisDevice: registered && db.auth.deviceId === deviceId,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/auth/register") {
      const { deviceId } = await readBody(req);
      if (!deviceId) {
        sendJson(res, 400, { ok: false, message: "Missing device id." });
        return;
      }
      if (db.auth?.deviceId && db.auth.deviceId !== deviceId) {
        recordEvent(db, "blocked-register", deviceId);
        writeDb(db);
        sendJson(res, 403, { ok: false, locked: true, message: "NiIM is already locked to another device." });
        return;
      }
      if (!db.auth) {
        const secret = randomBase32Secret();
        db.auth = {
          deviceId,
          secret,
          createdAt: new Date().toISOString(),
        };
        recordEvent(db, "registered", deviceId);
        writeDb(db);
      }
      sendJson(res, 200, {
        ok: true,
        secret: db.auth.secret,
        setupUri: `otpauth://totp/NiIM:Emmanuel?secret=${db.auth.secret}&issuer=NiIM&period=30&digits=6`,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/auth/verify") {
      const { deviceId, code } = await readBody(req);
      if (!db.auth?.deviceId) {
        sendJson(res, 409, { ok: false, message: "NiIM has not been registered yet." });
        return;
      }
      if (db.auth.deviceId !== deviceId) {
        recordEvent(db, "blocked-login", deviceId);
        writeDb(db);
        sendJson(res, 403, { ok: false, locked: true, message: "This app is locked to one device only." });
        return;
      }
      if (!verifyTotp(db.auth.secret, code)) {
        recordEvent(db, "bad-code", deviceId);
        writeDb(db);
        sendJson(res, 401, { ok: false, message: "That authenticator code did not match." });
        return;
      }
      recordEvent(db, "login", deviceId);
      writeDb(db);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && tryServeStatic(url, res)) return;
    sendJson(res, 404, { ok: false, message: "Route not found." });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`NiIM running on port ${port}`);
  console.log(`NiIM data directory: ${dataDir}`);
});
