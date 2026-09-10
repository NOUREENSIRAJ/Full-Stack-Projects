const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.log('DB connection error:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

const projectRoutes = require('../routes/projectRoutes');
const contactRoutes = require('../routes/contactRoutes');
const authRoutes = require('../routes/authRoutes');
const uploadRoutes = require('../routes/uploadRoutes');

app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('ArchStudio API is running...');
});

module.exports = app;