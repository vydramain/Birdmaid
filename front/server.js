import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  try {
    console.log(`Request: ${req.method} ${req.url}`);
    let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error reading file ${filePath}:`, error.code);
        if (error.code === 'ENOENT') {
          // SPA fallback: serve index.html for all routes
          const fallbackPath = path.join(__dirname, 'dist', 'index.html');
          fs.readFile(fallbackPath, (err, content) => {
            if (err) {
              console.error(`Error reading fallback ${fallbackPath}:`, err.code);
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end(`Server Error: ${err.code}\n`);
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            }
          });
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Server Error: ${error.code}\n`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.message}\n`);
    }
  }
});

server.on('connection', (socket) => {
  console.log('New connection from', socket.remoteAddress);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
