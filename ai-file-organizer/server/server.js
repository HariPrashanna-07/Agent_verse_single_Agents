const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory access if needed for uploads/organized files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/organized', express.static(path.join(__dirname, 'organized')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI File Organizer Agent API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/preview', require('./routes/previewRoutes'));
app.use('/api/organize', require('./routes/organizeRoutes'));
app.use('/api/undo', require('./routes/undoRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Central Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    // Attempt DB Connection
    try {
      await connectDB();
    } catch (dbErr) {
      logger.warn('MongoDB connection failed during startup. Server running in offline mode.');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
