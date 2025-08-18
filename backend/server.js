import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import path from 'path';

dotenv.config();


const app = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Connect Database
connectDB();

// Middleware
app.use(express.json());



// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API is running!', 
        status: 'success',
        timestamp: new Date().toISOString()
    });
})

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Serve uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
    });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to test the API`);
})