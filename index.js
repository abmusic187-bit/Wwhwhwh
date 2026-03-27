const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB (Use your Connection String in a .env file)
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to Free MongoDB!"))
  .catch(err => console.error("DB Connection Error:", err));

// 2. User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 3. Visual Puzzle Logic
const SHAPES = ['Square', 'Circle', 'Triangle', 'Star'];

app.get('/api/puzzle', (req, res) => {
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  res.json({ target, allShapes: SHAPES });
});

// 4. Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password, selectedShape, targetShape } = req.body;

  // Visual Puzzle Check
  if (selectedShape !== targetShape) {
    return res.status(400).json({ message: "Puzzle failed! Are you a robot?" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists." });

    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// 5. Login Route
app.post('/api/login', async (req, res) => {
  const { email, password, selectedShape, targetShape } = req.body;

  if (selectedShape !== targetShape) {
    return res.status(400).json({ message: "Puzzle failed!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email/password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email/password." });

    res.json({ message: "Logged in! Welcome to your server." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
