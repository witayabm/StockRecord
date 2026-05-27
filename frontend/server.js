const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const { loadEnv } = require("../src/env");

loadEnv();

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || process.env.PORT || 3000);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3001);
const API_BASE_URL =
  process.env.API_BASE_URL || `http://localhost:${BACKEND_PORT}`;

const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJavaScript(res, statusCode, script, method = "GET") {
  res.writeHead(statusCode, {
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": "no-store"
  });

  if (method === "HEAD") {
    res.end();
    return;
  }

  res.end(script);
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(text);
}

async function serveStaticAsset(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);

    if (!stat.isFile()) {
      throw new Error("Not a file");
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    const buffer = await fs.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": buffer.length,
      "Cache-Control": "no-store"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(buffer);
  } catch {
    if (pathname !== "/index.html") {
      await serveStaticAsset(req, res, "/index.html");
      return;
    }

    sendText(res, 404, "Frontend asset not found");
  }
}

async function handleFrontendRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method Not Allowed");
    return;
  }

  if (pathname.startsWith("/api/")) {
    sendText(res, 404, "Frontend server only serves static assets");
    return;
  }

  if (pathname === "/config.js") {
    sendJavaScript(
      res,
      200,
      `window.__APP_CONFIG__ = ${JSON.stringify({
        apiBaseUrl: API_BASE_URL,
        frontendBaseUrl: `http://localhost:${FRONTEND_PORT}`
      })};`,
      req.method
    );
    return;
  }

  await serveStaticAsset(req, res, pathname);
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    const frontendServer = http.createServer((req, res) => {
      handleFrontendRequest(req, res).catch((error) => {
        sendText(res, 500, `Frontend error: ${error.message}`);
      });
    });

    frontendServer.once("error", reject);
    frontendServer.listen(FRONTEND_PORT, () => {
      frontendServer.off("error", reject);
      console.log(`Frontend running at http://localhost:${FRONTEND_PORT}`);
      resolve(frontendServer);
    });
  });
}

if (require.main === module) {
  startFrontend().catch((error) => {
    console.error("Failed to start Stock Record frontend:", error);
    process.exit(1);
  });
}

module.exports = {
  handleFrontendRequest,
  startFrontend
};
