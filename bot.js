const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Redirect to the site link stored in environment variable
app.get('/', (req, res) => {
  res.redirect(process.env.SITE_LINK);
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Retrieve the Telegram bot token from the environment variable
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Create the Telegram bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  // Fetch the welcome message from the environment variable
  const welcomeMessage = process.env.WELCOME_MESSAGE.replace("{username}", username)
    .replace("{site_name}", process.env.SITE_NAME)
    .replace("{site_link}", process.env.SITE_LINK);

  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  // Fetch the help message from the environment variable
  const helpMessage = `📚 *${process.env.SITE_NAME} Bot Help & FAQ* 🤖

Here's how you can get started and start earning:

🔹 *1. Create an Account on ${process.env.SITE_NAME}*
   - Go to [${process.env.SITE_LINK}register](${process.env.SITE_LINK}register)
   - Fill in your details and register your free account.
   - After logging in, go to *Dashboard > Tools > API*.

🔹 *2. Get Your API Token*
   - Visit: [${process.env.SITE_LINK}member/tools/api](${process.env.SITE_LINK}member/tools/api)
   - Copy your unique *API Token*.

🔹 *3. Add API Token to This Bot*
   - Use the command: \`/api YOUR_API_TOKEN\`
   - Example: \`/api 123abc456xyz789\`

🔹 *4. Shorten and Share Links*
   - Just paste any link (starting with http or https) into this chat.
   - The bot will shorten it using your ${process.env.SITE_NAME} account.
   - Share this shortened link on social media, websites, or blogs.

💰 *Earn Money*
   - You earn up to **$5 per 1,000 views**.
   - More shares = More Views = More earnings!

Need more help? Visit [${process.env.SITE_LINK}contact](${process.env.SITE_LINK}contact)

Start shortening and earning now! 💸`;

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  });
});

// Command: /api
bot.onText(/\/api (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1].trim(); // Get the API token provided by the user

  // Save the user's Flame Url API token to the database
  saveUserToken(chatId, userToken);

  const response = `${process.env.SITE_NAME} API token set successfully. Your token: ${userToken}`;
  bot.sendMessage(chatId, response);
});

// Listen for any message (not just commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // If the message starts with "http://" or "https://", assume it's a URL and try to shorten it
  if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    shortenUrlAndSend(chatId, messageText);
  }
});

// Function to shorten the URL and send the result
async function shortenUrlAndSend(chatId, Url) {
  // Retrieve the user's Flame Url API token from the database
  const arklinksToken = getUserToken(chatId);

  if (!arklinksToken) {
    bot.sendMessage(chatId, `Please provide your ${process.env.SITE_NAME} API token first. Use the command: /api YOUR_${process.env.SITE_NAME}_API_TOKEN`);
    return;
  }

  try {
    const apiUrl = `${process.env.SITE_LINK}api?api=${arklinksToken}&url=${Url}`;

    // Make a request to the Flame Url API to shorten the URL
    const response = await axios.get(apiUrl);
    const shortUrl = response.data.shortenedUrl;

    const responseMessage = `Shortened URL: ${shortUrl}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    bot.sendMessage(chatId, `An error occurred while shortening the URL. Please check and confirm that you entered [your correct ${process.env.SITE_NAME} API token ](${process.env.SITE_LINK}member/tools/api), then try again.`);
  }
}

// Function to validate the URL format
function isValidUrl(url) {
  const urlPattern = /^(|ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
}

// Function to save user's Flame Url API token to the database (Replit JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's Flame Url API token from the database
function getUserToken(chatId) {
  const dbData = getDatabaseData();
  return dbData[chatId];
}

// Function to read the database file and parse the JSON data
function getDatabaseData() {
  try {
    return JSON.parse(fs.readFileSync('database.json', 'utf8'));
  } catch (error) {
    // Return an empty object if the file doesn't exist or couldn't be parsed
    return {};
  }
}
