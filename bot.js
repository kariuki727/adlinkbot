const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const app = express();

// --- Express Server Setup (for Koyeb/Web App hosting) ---
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

// --- Bot Configuration ---
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const demoApiToken = process.env.DEMO_API_TOKEN;
const EARN_API_TYPE = 1; 
const DEMO_API_TYPE = 1; 

const bot = new TelegramBot(botToken, { polling: true });

// --- Database Helper Functions ---

// Function to read the database file and parse the JSON data
function getDatabaseData() {
    try {
        return JSON.parse(fs.readFileSync('database.json', 'utf8'));
    } catch (error) {
        // Return an empty object if the file doesn't exist or couldn't be parsed
        return {};
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

// --- Core Shortening Functions ---

// Function to shorten a URL using the demo API (without requiring API setup)
async function shortenUrlUsingDemo(url) {
    try {
        const apiUrl = `https://snipn.cc/api?api=${demoApiToken}&url=${encodeURIComponent(url)}&format=text&type=${DEMO_API_TYPE}`;
        const response = await axios.get(apiUrl);
        return response.data.trim();
    } catch (error) {
        console.error('Error shortening URL (Demo):', error.response ? error.response.data : error.message);
        return 'Sorry, there was an error shortening the URL in demo mode.';
    }
}

// Function to shorten the URL and send the result (Earning or Demo mode)
async function shortenUrlAndSend(chatId, url, isDemo = false) {
    if (isDemo) {
        const shortenedUrl = await shortenUrlUsingDemo(url);
        const responseMessage = `Demo: Here's your shortened URL: ${shortenedUrl}\n\n`
            + 'Note: You are using the demo version. To start earning, please set up your own API token. See instructions by typing /start.';
        bot.sendMessage(chatId, responseMessage);
    } else {
        const userToken = getUserToken(chatId);

        if (!userToken) {
            // Safety fallback, although isDemo should handle this
            bot.sendMessage(chatId, 'Please provide your Snipn API token first. Use the command: /api YOUR_Snipn_API_TOKEN');
            return;
        }

        try {
            const apiUrl = `https://snipn.cc/api?api=${userToken}&url=${encodeURIComponent(url)}&format=text&type=${EARN_API_TYPE}`;
            const response = await axios.get(apiUrl);
            const shortUrl = response.data.trim(); 

            const responseMessage = `Shortened URL: ${shortUrl}`;
            bot.sendMessage(chatId, responseMessage);
        } catch (error) {
            console.error('Shorten URL Error (Earning Mode):', error.response ? error.response.data : error.message);
            bot.sendMessage(chatId, 'An error occurred while shortening the URL. Please check your API token and try again.');
        }
    }
}

// Function to extract URLs and shorten them
async function extractAndShortenUrls(chatId, text) {
    if (!text) {
        console.log('No text provided, unable to extract URLs.');
        return;
    }

    const urls = text.match(/https?:\/\/[^\s]+/g);
    if (urls) {
        for (const url of urls) {
            const userToken = getUserToken(chatId);
            shortenUrlAndSend(chatId, url, !userToken);
        }
    }
}

// --- Bot Command Handlers ---

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    const welcomeMessage = `Hey there, ${username}!\n\n`
        + '🌟 Welcome to the Snipn URL Shortener Bot! 🌟\n\n'
        + '✨ Ready to earn rewards while shortening links? You’ve come to the right place! 🚀\n\n'
        + '... (rest of welcome message) ...'; // Simplified for brevity

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "Try Demo / Open Mini App",
                    web_app: {
                        url: "https://briceka.com/tools/snipn/miniapp/index.html"
                    }
                }]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

// Command: /api
bot.onText(/\/api (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userToken = match[1].trim(); 

    saveUserToken(chatId, userToken);

    const response = `Snipn API token set successfully. Your token: ${userToken}`;
    bot.sendMessage(chatId, response);
});

// Mini App Command Handler (New command to handle the pre-filled message)
// THIS MUST BE AT THE TOP LEVEL, NOT INSIDE bot.on('message')
bot.onText(/\/shorten_app (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const encodedUrl = match[1].trim(); 
    
    // Log the received command for debugging
    console.log(`✅ [MINI APP COMMAND RECEIVED] Chat ID: ${chatId}. Command: ${msg.text}`);

    try {
        const url = decodeURIComponent(encodedUrl);
        const userToken = getUserToken(chatId);
        const isDemo = !userToken;
        
        shortenUrlAndSend(chatId, url, isDemo);

    } catch (e) {
        console.error('❌ Error decoding Mini App URL:', e);
        bot.sendMessage(chatId, 'Sorry, received an invalid URL from the Mini App.');
    }
});


// Handle the "Try Demo" button click
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    
    if (query.data === 'try_demo') {
        // ... (rest of callback logic) ...
        bot.sendMessage(chatId, demoMessage, { parse_mode: 'Markdown' });
    }
});


// Listen for any message (the default handler)
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // 🛑 IMPORTANT: REMOVE THE OLD web_app_data handler here 
    // since you switched to the /shorten_app command method.
    // However, if the user sends a non-command message, we still process it:

    // Check if the message contains text AND is NOT the command we handle above
    if (!messageText || messageText.startsWith('/')) {
        // This handles non-text messages, commands (like /start, /api, /shorten_app), 
        // or empty messages. Since commands are handled by bot.onText, we skip here.
        return; 
    }

    // If the message is a forwarded message, check for URLs in the text
    if (msg.forward_from || msg.forward_from_chat) {
        extractAndShortenUrls(chatId, messageText);
    }
    // If the message starts with "http://" or "https://", assume it's a URL and try to shorten it
    else if (messageText.startsWith('http://') || messageText.startsWith('https://')) {
        const userToken = getUserToken(chatId);
        shortenUrlAndSend(chatId, messageText, !userToken);
    }
    // Check if there are URLs in the message text and shorten all of them
    else {
        extractAndShortenUrls(chatId, messageText);
    }
});
