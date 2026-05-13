require('dotenv').config();

const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { startCacheRefreshJob } = require('./jobs/refreshCache');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ─────────────────────────────────────────
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Error Handler ──────────────────────────────────
app.use(errorHandler);

// ─── Start ──────────────────────────────────────────
// Bind to 0.0.0.0 so mobile devices on the same LAN can reach the server
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let lanIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIP = net.address;
        break;
      }
    }
  }
  console.log(`\n🗞️  Digest Backend running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${lanIP}:${PORT}`);
  console.log(`   Health:  http://${lanIP}:${PORT}/api/health`);
  console.log(`   News:    http://${lanIP}:${PORT}/api/news\n`);

  // Start the background cache refresh job
  startCacheRefreshJob();
});
