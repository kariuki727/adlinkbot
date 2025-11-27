const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  try {
    res.redirect('https://snipn.cc');
  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('I Love You, Kariuki!');
  }
});


const port = 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Retrieve the Telegram bot token and demo API token from the environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const demoApiToken = process.env.DEMO_API_TOKEN; // Ensure this is set to the token for the demo link
const EARN_API_TYPE = 1; // Default shortening type for earning
const DEMO_API_TYPE = 1; // Default shortening type for demo

// Create the Telegram bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const welcomeMessage = `Hey there, ${username}!\n\n`
    + '🌟 Welcome to the Snipn URL Shortener Bot! 🌟\n\n'
    + '✨ Ready to earn rewards while shortening links? You’ve come to the right place! 🚀\n\n'
    + 'With Snipn, you can shorten any URL and start earning every time someone clicks on it. 🤑💰\n\n'
    + 'It’s super easy – just drop your link here, and I’ll shorten it for you! You’ll get a fresh short link ready to share. 🔗✨\n\n'
    + 'Not set up your Snipn API token yet? No worries! Just send the command:\n'
    + '/api YOUR_API_TOKEN\n\n'
     + '💠 You can find your api key on https://snipn.cc/member/tools/api\n\n'
    + 'Let’s get started and watch those clicks roll in! 🔥👊\n\n'
    + 'Go ahead and try shortening your first link – the fun begins now! 🎉🎉';

  // Send welcome message with a "Try Demo" button
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "Try Demo / Open Mini App",
          web_app: {
            url: "https://briceka.com/tools/snipn/miniapp/index.html" // Replace with your actual Mini App URL
          }
        }]
      ]
    }
  };
  
  bot.sendMessage(chatId, welcomeMessage, options);
});

// Handle the "Try Demo" button click
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  
  if (query.data === 'try_demo') {
    const demoMessage = `You are using the *demo version* of Snipn. You can shorten any URL, but please note you will not earn rewards until you set up your own API token! 🚫💰\n\n`
    + `To start earning, go to [Snipn API page](https://snipn.cc/member/tools/api), copy your API token, and send it using the command: \n\n`
    + `/api YOUR_API_TOKEN\n\n`
    + `For example: \n\n`
    + `/api 7d035d0a298dae4987b94d63294f564c26accf66\n\n`
    + 'Now, send any URL to shorten it, or open the Mini App below!';
    
    bot.sendMessage(chatId, demoMessage, { parse_mode: 'Markdown' });
  }
});

// Function to shorten a URL using the demo API (without requiring API setup)
async function shortenUrlUsingDemo(url) {
  try {
    const apiUrl = `https://snipn.cc/api?api=${demoApiToken}&url=${encodeURIComponent(url)}&format=text&type=${DEMO_API_TYPE}`;
    const response = await axios.get(apiUrl);
    return response.data.trim();  // returns the shortened URL as plain text
  } catch (error) {
    console.error('Error shortening URL (Demo):', error.response ? error.response.data : error.message);
    return 'Sorry, there was an error shortening the URL in demo mode.';
  }
}

// Command: /api
bot.onText(/\/api (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1].trim(); // Get the API token provided by the user

  // Save the user's Snipn API token to the database
  saveUserToken(chatId, userToken);

  const response = `Snipn API token set successfully. Your token: ${userToken}`;
  bot.sendMessage(chatId, response);
});

// Listen for any message (not just commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // --- 🌟 NEW: Handle WebApp Data from the Mini App 🌟 ---
  if (msg.web_app_data && msg.web_app_data.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      
      if (data.action === 'shorten_url' && data.url) {
        const userToken = getUserToken(chatId);
        const isDemo = !userToken; // If token is null/undefined, use demo mode
        
        // Use existing function to handle shortening and response
        shortenUrlAndSend(chatId, data.url, isDemo); 
        return; // Stop processing further as this was Mini App data
      }
    } catch (e) {
      console.error('Error parsing web_app_data:', e);
      bot.sendMessage(chatId, 'Sorry, received corrupt data from the Mini App.');
      return;
    }
  }
  // --- END NEW WEBAPP DATA HANDLING ---

  // Check if the message contains text
  if (!messageText) {
    console.log('Received a non-text message or an empty message.');
    return;
  }

  // If the message is a forwarded message, check for URLs in the text
  if (msg.forward_from || msg.forward_from_chat) {
    extractAndShortenUrls(chatId, messageText);
  }
  // If the message starts with "http://" or "https://", assume it's a URL and try to shorten it
  else if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    // Check if user has a token, if not, use demo mode (isDemo = true)
    const userToken = getUserToken(chatId);
    shortenUrlAndSend(chatId, messageText, !userToken);
  }
  // Check if there are URLs in the message text and shorten all of them
  else {
    extractAndShortenUrls(chatId, messageText);
  }
});

// Function to extract URLs and shorten them
async function extractAndShortenUrls(chatId, text) {
  if (!text) {
    console.log('No text provided, unable to extract URLs.');
    return;
  }

  const urls = text.match(/https?:\/\/[^\s]+/g);  // Regular expression to find URLs
  if (urls) {
    for (const url of urls) {
      // Check if user has a token, if not, use demo mode (isDemo = true)
      const userToken = getUserToken(chatId);
      shortenUrlAndSend(chatId, url, !userToken);
    }
  }
}

// Function to shorten the URL and send the result
async function shortenUrlAndSend(chatId, url, isDemo = false) {
  let shortenedUrl;

  // If in demo mode, shorten the URL using the demo API token
  if (isDemo) {
    shortenedUrl = await shortenUrlUsingDemo(url);
    const responseMessage = `Demo: Here's your shortened URL: ${shortenedUrl}\n\n`
      + 'Note: You are using the demo version. To start earning, please set up your own API token. See instructions by typing /start.';
    bot.sendMessage(chatId, responseMessage);
  } else {
    // Normal shortening process (with user API token)
    const userToken = getUserToken(chatId);

    if (!userToken) {
      // Should not happen if isDemo is false, but as a safeguard
      bot.sendMessage(chatId, 'Please provide your Snipn API token first. Use the command: /api YOUR_Snipn_API_TOKEN');
      return;
    }

    try {
      // API URL using user's token and requesting plain text format
      const apiUrl = `https://snipn.cc/api?api=${userToken}&url=${encodeURIComponent(url)}&format=text&type=${EARN_API_TYPE}`;

      // Make a request to the Snipn API to shorten the URL
      const response = await axios.get(apiUrl);
      const shortUrl = response.data.trim(); // Expecting plain text URL response

      const responseMessage = `Shortened URL: ${shortUrl}`;
      bot.sendMessage(chatId, responseMessage);
    } catch (error) {
      console.error('Shorten URL Error (Earning Mode):', error.response ? error.response.data : error.message);
      bot.sendMessage(chatId, 'An error occurred while shortening the URL. Please check your API token and try again.');
    }
  }
}

// Function to save user's Snipn API token to the database (Replit JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's Snipn API token from the database
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
