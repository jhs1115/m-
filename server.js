const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "db.json");
const DATA_DIR = path.dirname(DB_PATH);
const PUBLIC_FILES = new Set(["/", "/index.html", "/style.css", "/game.js", "/supabase-config.js"]);

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], rooms: [], sessions: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function send(res, status, body) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 100_000) reject(new Error("Payload too large"));
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function makeRoomCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    coins: user.coins,
    ownedCharacters: user.ownedCharacters
  };
}

function publicRoom(db, room) {
  return {
    code: room.code,
    hostUserId: room.hostUserId,
    players: room.playerIds
      .map(id => db.users.find(user => user.id === id))
      .filter(Boolean)
      .map(publicUser)
  };
}

function getUserFromToken(db, req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const session = db.sessions.find(item => item.token === token);
  if (!session) return null;
  return db.users.find(user => user.id === session.userId) ?? null;
}

async function handleApi(req, res) {
  const db = readDb();

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/signup") {
    const { username, password } = await readJson(req);
    if (!username || !password) return send(res, 400, { error: "username and password required" });
    if (db.users.some(user => user.username === username)) return send(res, 409, { error: "username already exists" });

    const { salt, hash } = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      username,
      salt,
      passwordHash: hash,
      coins: 100,
      ownedCharacters: ["thrower"]
    };
    db.users.push(user);
    writeDb(db);
    return send(res, 201, { user: publicUser(user) });
  }

  if (req.method === "POST" && req.url === "/api/login") {
    const { username, password } = await readJson(req);
    const user = db.users.find(item => item.username === username);
    if (!user || !verifyPassword(password, user)) return send(res, 401, { error: "invalid login" });

    const token = crypto.randomBytes(32).toString("hex");
    db.sessions.push({ token, userId: user.id, createdAt: Date.now() });
    writeDb(db);
    return send(res, 200, { token, user: publicUser(user) });
  }

  const user = getUserFromToken(db, req);
  if (!user) return send(res, 401, { error: "login required" });

  if (req.method === "GET" && req.url === "/api/me") {
    return send(res, 200, { user: publicUser(user) });
  }

  if (req.method === "POST" && req.url === "/api/rooms") {
    let code = makeRoomCode();
    while (db.rooms.some(room => room.code === code)) code = makeRoomCode();

    const room = {
      code,
      hostUserId: user.id,
      playerIds: [user.id],
      createdAt: Date.now()
    };
    db.rooms.push(room);
    writeDb(db);
    return send(res, 201, { room: publicRoom(db, room) });
  }

  const getRoomMatch = req.url.match(/^\/api\/rooms\/([A-Z0-9]+)$/);
  if (req.method === "GET" && getRoomMatch) {
    const room = db.rooms.find(item => item.code === getRoomMatch[1]);
    if (!room) return send(res, 404, { error: "room not found" });
    return send(res, 200, { room: publicRoom(db, room) });
  }

  const joinMatch = req.url.match(/^\/api\/rooms\/([A-Z0-9]+)\/join$/);
  if (req.method === "POST" && joinMatch) {
    const room = db.rooms.find(item => item.code === joinMatch[1]);
    if (!room) return send(res, 404, { error: "room not found" });
    if (!room.playerIds.includes(user.id)) room.playerIds.push(user.id);
    writeDb(db);
    return send(res, 200, { room: publicRoom(db, room) });
  }

  if (req.method === "POST" && req.url === "/api/gacha") {
    const pool = ["charger", "grabber"].filter(kind => !user.ownedCharacters.includes(kind));
    if (user.coins < 50) return send(res, 400, { error: "not enough coins" });
    if (pool.length === 0) return send(res, 400, { error: "all characters owned" });

    const picked = pool[Math.floor(Math.random() * pool.length)];
    user.coins -= 50;
    user.ownedCharacters.push(picked);
    writeDb(db);
    return send(res, 200, { picked, user: publicUser(user) });
  }

  return send(res, 404, { error: "not found" });
}

function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  const url = pathname === "/" ? "/index.html" : pathname;
  if (!PUBLIC_FILES.has(url)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const filePath = path.join(__dirname, url.slice(1));
  const ext = path.extname(filePath);
  const type = ext === ".css" ? "text/css" : ext === ".js" ? "text/javascript" : "text/html";
  res.writeHead(200, { "Content-Type": `${type}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    send(res, 200, { ok: true });
    return;
  }

  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch(error => send(res, 500, { error: error.message }));
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`M zzang server running on http://${HOST}:${PORT}`);
});
