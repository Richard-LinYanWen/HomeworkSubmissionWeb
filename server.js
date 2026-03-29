const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Blueprints from the models folder
const User = require('./models/user');
const Submission = require('./models/submission');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serves your HTML/CSS/JS

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to Online MongoDB Cluster"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// 2. REGISTER ROUTE
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account created!" });
    } catch (err) {
        res.status(400).json({ message: "Error: User might already exist." });
    }
});

// 3. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        res.json({ message: "Login successful!", username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 4. SUBMISSION ROUTE
app.post('/api/submit', async (req, res) => {
    try {
        const newSubmission = new Submission(req.body);
        await newSubmission.save();
        res.json({ message: "Homework saved to database!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save submission" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));