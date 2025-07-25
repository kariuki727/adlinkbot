require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Client } = require('pg');  // PostgreSQL example; or mysql2 for MySQL
const fs = require('fs');

// Load environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const demoApiUrl = process.env.DEMO_API_URL;  // Demo API URL from environment
const supportChannelLink = process.env.SUPPORT_CHANNEL_LINK;
const siteUrl = process.env.SITE_URL;  // Site URL from environment
const siteName = process.env.SITE_NAME;  // Site name from environment
const apiToken = process.env.API_TOKEN;  // Site's default API token if needed
const databaseHost = process.env.DATABASE_HOST;
const databaseUser = process.env.DATABASE_USERNAME;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE_NAME;
const welcomeMessage = process.env.WELCOME_MESSAGE;
const siteApiUrl = process.env.SITE_API_URL;  // Base API URL for shortening links

// Initialize database connection (Example: PostgreSQL)
const db = new Client({
  host: databaseHost,
  user: databaseUser,
  password: databasePassword,
  database: databaseName
});
db.connect();

// Create the Telegram bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  const welcome = welcomeMessage || `Hello, ${username}! Welcome to the ${siteName} Shortener Bot! Please use the commands below to get started.`;
  bot.sendMessage(chatId, welcome);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `📚 *Help & FAQ* 🤖

To start using the bot:

1. Register at [${siteName}](${siteUrl}) to get your API Token.
2. Add your API token with the /api command: \`/api YOUR_API_TOKEN\`
3. Paste any link to shorten it.
4. To see stats, use the /stats command.

Join our support channel: [Support Channel](${supportChannelLink})`;

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  });
});

// Handle /api command to store user's API token
bot.onText(/\/api (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1].trim();

  // Save the API token to the database
  saveUserToken(chatId, userToken, (success) => {
    if (success) {
      bot.sendMessage(chatId, `Your API token has been successfully set!`);
    } else {
      bot.sendMessage(chatId, `An error occurred while saving your token. Please try again.`);
    }
  });
});

// Handle messages (shortening URLs or demo service)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    // Check if the user has set their API token
    getUserToken(chatId, (userToken) => {
      if (!userToken) {
        // Offer demo shortening if no token set
        shortenUrlUsingDemoApi(chatId, messageText);
      } else {
        // Proceed with the user's API token and shorten the link
        shortenUrl(chatId, userToken, messageText);
      }
    });
  }
});

// Function to shorten URL using the demo API (for users who haven't logged in)
function shortenUrlUsingDemoApi(chatId, Url) {
  axios.get(`${demoApiUrl}?url=${Url}`)
    .then(response => {
      const demoShortenedUrl = response.data.shortenedUrl;
      bot.sendMessage(chatId, `Demo Shortened URL: ${demoShortenedUrl}\n\nTo get started and track earnings, please register on the site and provide your own API token.`);
    })
    .catch(error => {
      console.error('Demo URL Shorten Error:', error);
      bot.sendMessage(chatId, `An error occurred while shortening the URL. Please try again later.`);
    });
}

// Function to shorten URL using the site's API (using the API token)
function shortenUrl(chatId, apiToken, Url) {
  const encodedUrl = encodeURIComponent(Url);
  const apiUrl = `${siteApiUrl}?api=${apiToken}&url=${encodedUrl}&alias=CustomAlias`;  // Base API URL from environment variable

  // Request to the site's API to shorten the URL
  axios.get(apiUrl)
    .then(response => {
      if (response.data.status === 'success') {
        const shortenedUrl = response.data.shortenedUrl;
        bot.sendMessage(chatId, `Shortened URL: ${shortenedUrl}`);
      } else {
        bot.sendMessage(chatId, `An error occurred: ${response.data.message}. Please check your API token and try again.`);
      }
    })
    .catch(error => {
      console.error('API Error:', error);
      bot.sendMessage(chatId, `An error occurred while shortening the URL. Please try again later.`);
    });
}

// Function to save the user's API token to the database
function saveUserToken(chatId, apiToken, callback) {
  const query = 'INSERT INTO users (chatId, apiToken) VALUES ($1, $2) ON CONFLICT (chatId) DO UPDATE SET apiToken = $2';
  db.query(query, [chatId, apiToken], (err) => {
    if (err) {
      console.error('Database Error:', err);
      callback(false);
    } else {
      callback(true);
    }
  });
}

// Function to get the user's API token from the database
function getUserToken(chatId, callback) {
  const query = 'SELECT apiToken FROM users WHERE chatId = $1';
  db.query(query, [chatId], (err, res) => {
    if (err || res.rows.length === 0) {
      callback(null);
    } else {
      callback(res.rows[0].apiToken);
    }
  });
}

bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

// Handle database connection issues
db.on('error', (err) => {
  console.error('Database Connection Error:', err);
});
