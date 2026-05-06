const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "frontend");
const dataDir = path.join(__dirname, "backend", "data");
const dbPath = path.join(dataDir, "users.json");
const startPort = Number(process.env.PORT) || 5173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const ensureDb = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], sessions: [] }, null, 2));
  }
};

const readDb = () => {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
};

const writeDb = (db) => {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

const sendJson = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1_000_000) {
      req.destroy();
      reject(new Error("Payload too large"));
    }
  });
  req.on("end", () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch (error) {
      reject(error);
    }
  });
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
};

const verifyPassword = (password, user) => {
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
};

const createSession = (db, userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  return token;
};

const handleApi = async (req, res, urlPath) => {
  if (req.method === "POST" && urlPath === "/api/signup") {
    const body = await readJsonBody(req);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!name || !email || password.length < 6) {
      sendJson(res, 400, { error: "Name, email, and a 6 character password are required." });
      return;
    }

    const db = readDb();
    if (db.users.some((user) => user.email === email)) {
      sendJson(res, 409, { error: "An account with this email already exists." });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = createSession(db, user.id);
    writeDb(db);
    sendJson(res, 201, { token, user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && urlPath === "/api/login") {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const db = readDb();
    const user = db.users.find((candidate) => candidate.email === email);

    if (!user || !verifyPassword(password, user)) {
      sendJson(res, 401, { error: "Invalid email or password." });
      return;
    }

    const token = createSession(db, user.id);
    writeDb(db);
    sendJson(res, 200, { token, user: publicUser(user) });
    return;
  }

  if (req.method === "GET" && urlPath === "/api/me") {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const db = readDb();
    const session = db.sessions.find((item) => item.token === token);
    const user = session && db.users.find((candidate) => candidate.id === session.userId);

    if (!user) {
      sendJson(res, 401, { error: "Not authenticated." });
      return;
    }

    sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  sendJson(res, 404, { error: "API route not found." });
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath.startsWith("/api/")) {
    handleApi(req, res, urlPath).catch(() => {
      sendJson(res, 500, { error: "Server error." });
    });
    return;
  }

  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(root, requested));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain; charset=utf-8" });
    res.end(data);
  });
});

const listen = (port) => {
  server.listen(port, () => {
    console.log(`WDRB running at http://localhost:${port}`);
  });
};

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const nextPort = Number(error.port) + 1;
    console.log(`Port ${error.port} is already in use. Trying http://localhost:${nextPort}`);
    listen(nextPort);
    return;
  }

  throw error;
});

listen(startPort);
