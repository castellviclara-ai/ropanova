import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the TanStack Start server handler
const { default: app } = await import("./dist/server/server.js");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Serve static files from dist/client
  if (req.url.startsWith("/assets/") || req.url === "/favicon.ico") {
    try {
      const filePath = join(__dirname, "dist/client", req.url);
      const content = readFileSync(filePath);
      const ext = req.url.split(".").pop();
      const mimeTypes = {
        js: "application/javascript",
        css: "text/css",
        ico: "image/x-icon",
        png: "image/png",
        svg: "image/svg+xml",
        woff2: "font/woff2",
      };
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      res.end(content);
      return;
    } catch {}
  }

  // Handle SSR requests
  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body?.length ? body : undefined,
    });

    const response = await app.fetch(request, {}, {});

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
