require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('❌ CRITICAL: MONGO_URI is not defined in environment variables!');
}

mongoose.connect(mongoURI || 'mongodb://localhost:27017/luzrd')
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error Details:');
        console.error(err);
    });


// Middleware
app.use(cors({
    origin: '*', // Allow all for now to debug, then we can restrict
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const reportRoutes = require('./routes/report.routes');
app.use('/api/reportes', reportRoutes);

app.get('/', (req, res) => {
    res.send('Problemas RD API (Local Storage) is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (LOCAL STORAGE MODE)`);
});
