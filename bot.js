const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.redirect('https://snipn.cc/');
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
  const welcomeMessage = `Howdy🤝, ${username}!🌟\n\n`
    + 'I’m here to help you shorten your links🔗 and start earning up to $20 for every 1,000 clicks.🫰💰\n\n'
    + 'Just send me the link you want to shorten, type or paste the URL directly, and I’ll take care of the rest.😜\n\n'
    + 'To shorten a URL, just type or paste the URL directly in the chat, and the bot will provide you with the shortened URL.\n\n'
    + 'Let’s get started! 💸👇';

  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `📚 *Snipn.cc Bot Help & FAQ* 🤖

Here's how you can get started and start earning:

🔹 *1. Create an Account on Snipn.cc*
   - Go to [https://snipn.cc/register](https://snipn.cc/register)
   - Fill in your details and register your free account.
   - After logging in, go to *Dashboard > Tools > API*.

🔹 *2. Get Your API Token*
   - Visit: [https://snipn.cc/member/tools/api](https://snipn.cc/member/tools/api)
   - Copy your unique *API Token*.

🔹 *3. Add API Token to This Bot*
   - Use the command: \`/api YOUR_API_TOKEN\`
   - Example: \`/api 123abc456xyz789\`

🔹 *4. Shorten and Share Links*
   - Just paste any link (starting with http or https) into this chat.
   - The bot will shorten it using your Snipn account.
   - Share this shortened link on social media, websites, or blogs.

💰 *Earn Money*
   - You earn up to **$20 per 1,000 clicks**.
   - More shares = More clicks = More earnings!

Need more help? Visit [https://snipn.cc/contact](https://snipn.cc/contact)

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

  // Save the user's SNIPN API token to the database
  saveUserToken(chatId, userToken);

  const response = `Snipn API token set successfully. Your token: ${userToken}`;
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
  // Retrieve the user's SNIPN API token from the database
  const arklinksToken = getUserToken(chatId);

  if (!arklinksToken) {
    bot.sendMessage(chatId, 'Please provide your SNIPN API token first. Use the command: /api YOUR_SNIPN_API_TOKEN');
    return;
  }

  try {
    const apiUrl = `https://snipn.cc/api?api=${arklinksToken}&url=${Url}`;

    // Make a request to the SNIPN API to shorten the URL
    const response = await axios.get(apiUrl);
    const shortUrl = response.data.shortenedUrl;


    const responseMessage = `Shortened URL: ${shortUrl}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    bot.sendMessage(chatId, 'An error occurred while shortening the URL. Please check and confirm that you entered [your correct Snipn API token ](https://snipn.cc/member/tools/api) , then try again.');
  }
}

// Function to validate the URL format
function isValidUrl(url) {
  const urlPattern = /^(|ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
}

// Function to save user's SNIPN API token to the database (Replit JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's SNIPN API token from the database
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
