const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

// Fetch configuration from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const websiteUrl = process.env.ADLINKFLY_API_URL;
const apiKey = process.env.ADLINKFLY_API_KEY;
const supportChannelLink = process.env.SUPPORT_CHANNEL_LINK;
const dbUri = process.env.DATABASE_URL;

// Initialize Telegram Bot
const bot = new TelegramBot(botToken, { polling: true });

// Connect to the database (MongoDB in this case)
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));

// Define a user schema for MongoDB (you can expand this based on your needs)
const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  apiToken: { type: String, required: true },
  isInSupportChannel: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const welcomeMessage = `Hello, ${username}! 👋\n\n`
    + 'Welcome to our URL Shortener Bot! 🚀\n\n'
    + 'Before using the bot, please make sure you are a member of our support channel: \n'
    + `${supportChannelLink}\n\n`
    + 'To get started, please log in using the command: /login';

  bot.sendMessage(chatId, welcomeMessage);
});

// Command: /login
bot.onText(/\/login/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please enter your username and password (e.g., username password) to log in.');
});

// Handle login details (username password)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message is a login request (username password)
  if (messageText && messageText.includes(' ')) {
    const [username, password] = messageText.split(' ');

    // Verify user credentials with your website’s database
    try {
      const response = await axios.post(`${websiteUrl}/api/verify-login`, { username, password });
      
      if (response.data.success) {
        const userApiToken = response.data.token;

        // Check if the user is in the support channel
        const isMember = await bot.getChatMember(supportChannelLink, chatId);
        if (isMember.status === 'member' || isMember.status === 'administrator') {
          // Save the user credentials (username and apiToken) in the database
          let user = await User.findOne({ chatId });
          if (!user) {
            user = new User({ chatId, username, apiToken: userApiToken });
          } else {
            user.apiToken = userApiToken;
          }
          await user.save();

          bot.sendMessage(chatId, `Welcome back, ${username}! You are successfully logged in.`);
        } else {
          bot.sendMessage(chatId, 'You must be a member of the support channel to use this bot. Please join the channel first: ' + supportChannelLink);
        }
      } else {
        bot.sendMessage(chatId, 'Invalid username or password. Please try again or register on the website.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      bot.sendMessage(chatId, 'There was an error logging in. Please try again later.');
    }
  }
});

// Command to shorten URLs
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message is a valid URL
  if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    // Get the user's data from the database
    const user = await User.findOne({ chatId });
    if (!user) {
      return bot.sendMessage(chatId, 'You must log in first using the /login command.');
    }

    // Shorten the URL using AdLinkFly API
    try {
      const response = await axios.get(`${websiteUrl}/api/shorten?api_key=${user.apiToken}&url=${messageText}`);
      const shortUrl = response.data.shortenedUrl;

      bot.sendMessage(chatId, `Here’s your shortened URL: ${shortUrl}`);
    } catch (error) {
      console.error('Error shortening URL:', error);
      bot.sendMessage(chatId, 'There was an error shortening your URL. Please try again later.');
    }
  }
});

// Function to display error and guidance messages
function showErrorAndHelp(chatId, errorMessage) {
  bot.sendMessage(chatId, `${errorMessage}\n\nIf you're unsure how to proceed, please visit our website for help or contact support.`);
}

// Additional Error Handling (Optional, for bot interactions)
bot.on("polling_error", (err) => {
  console.error("Polling error:", err);
});
