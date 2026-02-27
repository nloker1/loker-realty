const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const pool = require('./db')
const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// --- BOT-FRIENDLY OPEN GRAPH MIDDLEWARE ---
// This ensures that iMessage, Facebook, and Twitter show the big property photo
app.get('/property/:slug/:mls_number', async (req, res, next) => {
    const { mls_number } = req.params;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const botPatterns = ['facebookexternalhit', 'twitterbot', 'slackbot', 'linkedinbot', 'whatsapp', 'telegrambot', 'discordbot', 'slack-imgproxy'];
    const isBot = botPatterns.some(pattern => userAgent.includes(pattern));

    // If it's not a bot, let the React frontend handle it
    if (!isBot) {
        return next();
    }

    try {
        const result = await pool.query('SELECT * FROM listings WHERE mls_number = $1', [mls_number]);
        const listing = result.rows[0];

        if (!listing) return next();

        // 1. Read the base index.html
        const buildPath = path.join(__dirname, '../frontend/build/index.html');
        if (!fs.existsSync(buildPath)) return next();
        
        let html = fs.readFileSync(buildPath, 'utf8');

        // 2. Prepare dynamic meta tags
        const priceFormatted = listing.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        const title = `${listing.address}, ${listing.city}, ${listing.state} | ${priceFormatted} | Gorge Realty`;
        const description = `${listing.beds} beds, ${listing.baths} baths, ${listing.sqft?.toLocaleString()} sqft. View full details and schedule a showing with Nate Loker.`;
        const imageUrl = listing.photo_url || 'https://gorgerealty.com/gorge_photo.jpg';

        // 3. Inject tags into the head
        const ogTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="https://gorgerealty.com/property/${req.params.slug}/${mls_number}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
        `;

        // Replace generic title if it exists, otherwise just inject after <head>
        if (html.includes('<title>')) {
            html = html.replace(/<title>.*?<\/title>/, ogTags);
        } else {
            html = html.replace('<head>', '<head>' + ogTags);
        }

        // 4. Send the bot-optimized HTML
        res.send(html);

    } catch (err) {
        console.error('Bot Middleware Error:', err);
        next();
    }
});


// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for cross-origin requests


// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
  family: 4, // Force IPv4 — fixes DigitalOcean IPv6 resolution issues
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
    res.send("🚀 Gorge Realty API is running!");
});

const client = SibApiV3Sdk.ApiClient.instance;
let apiKeyAuth = client.authentications['api-key'];
apiKeyAuth.apiKey = process.env.BREVO_API_KEY; // Store API Key in .env

const apiInstance = new SibApiV3Sdk.ContactsApi();
const BREVO_LIST_ID = 6;

// Subscribe User API Route
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Insert into database
        const result = await pool.query(
            `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *;`,
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({ message: "Already subscribed!" });
        }

        // Send data to Brevo
        const contactInfo = {
            email: email,
            listIds: [BREVO_LIST_ID], // Add the subscriber to your Brevo list
            updateEnabled: true, // Updates existing contacts if they already exist
        };

        await apiInstance.createContact(contactInfo);

        res.status(201).json({ success: true, message: "Subscribed successfully and added to email list!" });

    } catch (error) {
        console.error("❌ Error:", error);

        // Check if it's a Brevo error
        if (error.response && error.response.body) {
            console.error("Brevo API Error:", error.response.body);
        }

        res.status(500).json({ error: "An error occurred. Try again later." });
    }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});