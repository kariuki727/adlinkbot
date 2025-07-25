const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.redirect(process.env.WEBSITE_URL);
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
    + 'I\'m here to help you shorten your links🔗 and start earning up to $20 for every 1,000 clicks.🫰💰\n\n'
    + 'Just send me the link you want to shorten, type or paste the URL directly, and I\'ll take care of the rest.😜\n\n'
    + 'Let\'s get started! 💸👇\n\n'
    + 'How To Use Me 👇👇 \n\n'
    + '✅1. Sign in to your account on the website.\n\n'
    + '✅2. Then Copy Your API Key Only. \n\n'
    + '✅3. Then add your API to this bot using command /api \n\n' 
    + 'Example: `/api 7d035d0a298dae4987b94d63294f564c26accf66`\n\n'
    + '⚠️ After setting up the Developer API, send any link in the format https:// or http:// and let me do the shortening for you.\n\n'
    + '👀 *Not ready to register yet? Try the demo or click the help button for a detailed guide!*';

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Try Demo', callback_data: 'try_demo' }]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, welcomeMessage, options); // Send the message with the keyboard properly formatted
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `📚 *${process.env.WEBSITE_NAME} Bot Help & FAQ* 🤖

Here's how you can get started and start earning:

🔹 *1. Create an Account on ${process.env.WEBSITE_NAME}*
   - Go to [${process.env.WEBSITE_URL}/register](${process.env.WEBSITE_URL}/register)
   - Fill in your details and register your free account.
   - After logging in, go to *Dashboard > Tools > API*.

🔹 *2. Get Your API Token*
   - Visit: [${process.env.WEBSITE_URL}/member/tools/api](${process.env.WEBSITE_URL}/member/tools/api)
   - Copy your unique *API Token*.

🔹 *3. Add API Token to This Bot*
   - Use the command: \`/api YOUR_API_TOKEN\`
   - Example: \`/api 7d035d0a298dae4987b94d63294f564c26accf66\``;

🔹 *4. Shorten and Share Links*
   - Just paste any link (starting with http or https) into this chat.
   - The bot will shorten it using your ${process.env.WEBSITE_NAME} account.
   - Share this shortened link on social media, websites, or blogs.

💰 *Earn Money*
   - You earn up to **$20 per 1,000 clicks**.
   - More shares = More clicks = More earnings!

Need more help? Visit [${process.env.WEBSITE_URL}/contact](${process.env.WEBSITE_URL}/contact)

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

  // Save the user's API token to the database
  saveUserToken(chatId, userToken);

  const response = `✅ ${process.env.WEBSITE_NAME} API token set successfully.\nYour token: ${userToken}`;
  bot.sendMessage(chatId, response);
});

// /demo command for trial shortening
bot.onText(/\/demo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const demoUrl = match[1].trim();

  if (!isValidUrl(demoUrl)) {
    bot.sendMessage(chatId, '❌ Invalid URL. Please provide a valid link starting with http or https.');
    return;
  }

  try {
    const demoToken = process.env.DEMO_API_TOKEN;
    const encodedUrl = encodeURIComponent(demoUrl);
    const apiUrl = `${process.env.WEBSITE_URL}/api?api=${demoToken}&url=${encodedUrl}&format=text&type=1`;

    const response = await axios.get(apiUrl);
    const shortUrl = response.data;

    bot.sendMessage(chatId, `✅ *Demo Shortened URL:*\n${shortUrl}\n\n⚠️ This is just a demo. You won’t earn from this. To start earning, [sign up at ${process.env.WEBSITE_URL}/auth/signup](${process.env.WEBSITE_URL}/auth/signup) and use your API token with \`/api YOUR_TOKEN\`.`, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
  } catch (error) {
    console.error('Demo Shorten Error:', error.message);
    bot.sendMessage(chatId, '⚠️ Could not shorten the link in demo mode. Please try again later.');
  }
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
  // Retrieve the user's API token from the database
  const arklinksToken = getUserToken(chatId);

  if (!arklinksToken) {
    bot.sendMessage(chatId, 'your ${process.env.WEBSITE_NAME} API token first. Use the command: /api YOUR_API_TOKEN');
    return;
  }

  try {
    const apiUrl = `${process.env.WEBSITE_URL}/api?api=${arklinksToken}&url=${Url}`;

    // Make a request to the API to shorten the URL
    const response = await axios.get(apiUrl);
    const shortUrl = response.data.shortenedUrl;


    const responseMessage = `Shortened URL: ${shortUrl}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    bot.sendMessage(chatId, '⚠️ An error occurred while shortening the link. Please try again.');
  }
}

// Function to validate the URL format
function isValidUrl(url) {
  const urlPattern = /^(|ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
}

// Function to save user's API token to the database (Replit JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's API token from the database
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
