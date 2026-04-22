const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', aiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
