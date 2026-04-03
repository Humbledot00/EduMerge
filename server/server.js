const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://edu-merge-alpha.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (e.g., server-to-server, mobile clients)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    const msg = `CORS policy: origin ${origin} not allowed`;
    return callback(new Error(msg), false);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Single entry point for all API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
