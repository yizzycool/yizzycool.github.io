const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const https = require('https');

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
  const filePath = path.join(__dirname, '../out', `${req.originalUrl}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      next(); // if any error occurred, go to next middleware handler
    }
  });
});

// Static file server
app.use('/', express.static(path.join(__dirname, '../out')));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(80);
httpsServer.listen(443);
