import path from 'path';
import fs from 'fs';
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import https from 'https';

const httpsOptions = {
  key: fs.readFileSync(
    path.join(__dirname, '../certificates/localhost-key.pem')
  ),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
};

const app = express();

// For debug info
app.use(morgan('dev'));

// Add file extension
app.use((req, res, next) => {
  const safePath = path.resolve(__dirname, '../out');
  // Use req.path instead of req.originalUrl (req.path is normalized, decoded, and stripped of query params)
  const filePath = path.join(safePath, `${req.path}.html`);

  // Verify that the resolved file path resides strictly inside the 'out' directory
  const relativePath = path.relative(safePath, filePath);
  const isSafe =
    relativePath &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath);

  if (isSafe) {
    res.sendFile(filePath, (err) => {
      if (err) {
        next(); // If file not found, fall back to express.static
      }
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

// Static file server
app.use('/', express.static(path.join(__dirname, '../out')));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(80);
httpsServer.listen(443);
