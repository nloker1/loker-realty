const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const pool = require('./db')
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for cross-origin requests

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for email
    pass: process.env.EMAIL_PASSWORD, // Use environment variable for password
  },
});

app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Mail options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // Ensure recipient is set from env
      subject: `New message from ${name}`,
      text: message,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message successfully sent!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});


app.get("/", (req, res) => {
    res.send("🚀 Loker Realty API is running!");
});

// Subscribe User API Route
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *;`,
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({ message: "Already subscribed!" });
        }

        res.status(201).json({ success: true, message: "Subscribed successfully!" });

    } catch (error) {
        console.error("❌ Database error:", error);
        res.status(500).json({ error: "Database error. Try again later." });
    }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});