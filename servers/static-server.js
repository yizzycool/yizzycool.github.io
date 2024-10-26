const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const https = require('https');

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../misc/ssl/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../misc/ssl/localhost.pem')),
};

const app = express();
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, '../out')));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(80);
httpsServer.listen(443);
