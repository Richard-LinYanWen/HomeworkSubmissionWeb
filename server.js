require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import Blueprints from the models folder
const User = require('./models/user');
const Submission = require('./models/submission');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serves your HTML/CSS/JS

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//fallback vercel root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI, { family : 4 })
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
app.post('/api/upload', upload.single('homeworkFile'), async (req, res) => {
    try {
        const username = req.body.username;
        const hwNumber = String(req.body.hwNumber);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        // Convert the file buffer to a String (The .cpp code)
        const cppCode = req.file.buffer.toString('utf8');

        // This replaces the previous submission for this specific User + HW
        const result = await Submission.findOneAndUpdate(
            { username: username, hwNumber: hwNumber }, 
            { 
                fileName: req.file.originalname,
                codeContent: req.file.buffer.toString('utf8'),
                submittedAt: Date.now() 
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ 
            message: "Submission saved to Cluster successfully!",
            id: result._id 
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server failed to save to Cluster." });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));