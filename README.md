# AdLinkFly Telegram Bot

## Demo Bot: [@snipnbot](https://t.me/snipnbot)

This Telegram bot integrates **AdLinkFly** with Telegram to allow users to shorten long URLs, track clicks and visits, and monitor their earnings directly from their personal accounts via Telegram. The bot interacts with the AdLinkFly API and offers the following features:

---

### **🛠️ Key Features:**
- **URL Shortening:** Send long URLs to the bot and get a shortened version generated through your connected AdLinkFly account.
- **Click and Visit Tracking:** Fetch real-time click and visit data from the AdLinkFly API and display it in your Telegram chat.
- **Earnings Overview:** Monitor your earnings directly through the bot by fetching your earnings data from AdLinkFly.
- **Custom Aliases:** Generate shortened URLs with custom aliases for better branding.

---

### **🔧 How to Use:**

1. **Connect API:**
   - To use the bot, you need to connect your **AdLinkFly API key**.
   - The bot will guide you to enter your API key from your AdLinkFly account.

2. **Send Long URLs:**
   - After connecting your API, just send long URLs to the bot, and it will provide a shortened version.

3. **Track Stats:**
   - The bot will fetch click and visit statistics for your shortened URLs in real time.

---

### **🔑 Required Environment Variables:**

To deploy and run the bot, you'll need to set the following environment variables:

```env
# Telegram Bot Token (Get from BotFather on Telegram)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here

# AdLinkFly API URL for shortening
SITE_API_URL=https://yoursite.com/api

# Demo API URL for users who haven't provided their API key
DEMO_API_URL=https://your-demo-api-url.com/shorten

# Site details (Customize these for your site)
SITE_URL=https://yoursite.com
SITE_NAME=YourSiteNameHere
SUPPORT_CHANNEL_LINK=https://t.me/your-support-channel

# Database credentials (For storing user tokens and stats)
DATABASE_HOST=your-database-host
DATABASE_USERNAME=your-database-username
DATABASE_PASSWORD=your-database-password
DATABASE_NAME=your-database-name

# Welcome message to display on /start command
WELCOME_MESSAGE=Welcome to ${SITE_NAME} Shortener Bot! Use /api to add your API token and start shortening links.
```

### **Developed with ❤️ by [KARIUKI](https://github.com/kariuki727)**
**Sponsored by [Briceka Enterprise](https://bricekainc.github.io/)**

