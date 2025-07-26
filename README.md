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

<p align="center">

![Fork](https://img.shields.io/github/forks/kariuki727/adlinkbot?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/kariuki727/adlinkbot?color=%23&style=for-the-badge)
![License](https://img.shields.io/github/license/kariuki727/adlinkbot?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/kariuki727/adlinkbot?style=for-the-badge)

</p>

---

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/kariuki727/adlinkbot">
    <img src="https://i.ibb.co/1mwchh9/Screenshot-2022-07-08-at-11-06-34-AM.png" alt="Logo" width="20" height="20">
  </a>

  <h3 align="center">AdLinkFly Telegram Bot</h3>

  <p align="center">
    Shorten Links & Earn Highest CPM Online Instantly
    <br />
    ·
    <a href="https://support.briceka.com/">Report Bug</a>
    ·
    <a href="https://github.com/kariuki727/adlinkbot#features">Features</a>
    ·
    <a href="https://github.com/kariuki727/adlinkbot#deploy">Deploy</a>
    ·
    <a href="https://github.com/kariuki727/adlinkbot#required-variables">Variables</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#description">Description</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#commands">Commands</a></li>
    <li>
        <a href="#about">About</a>
        <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#required-variables">Required Variables</a></li>
        <li><a href="#optional-variables">Optional Variables</a></li>
      </ul>
      </li>
    <li><a href="#deploy">Deploy</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#support">Support</a></li>
    <li><a href="#disclaimer">Disclaimer</a></li>
    <li><a href="#credits">Credits</a></li>
  </ol>
</details>

---

## Description

> **Now this bot can be used by users also. Only admin has access to channel support. Bot Owner API will be used in channel post converting. You can restrict users from using this bot by setting env `IS_PRIVATE` to True**

**This Is Just An Simple Advance Shortener and Converter Bot Completely Rewritten Version Of [URL Shortener](https://github.com/t2links/URL-Shortener-bot)**

**Just Send Any Link To Short. It Will Short Link or Save it to your MDisk Account**

## Usage

\***\*How To Use Me!?\*\***

- -> Send any link or post of links

- -> Add me to your channel as admin with full previlages to convert channel's post

> For more information about usages, see the [documentation](https://github.com/kariuki727/adlinkbot/wiki/Usage)

## Commands

```
start - start it
help - help Command
about - about Command
method - to set your preferred method
shortener_api - set shortener api
mdisk_api - set mdisk api
header - set header
footer - set footer
username - set username to replace others
banner_image - set banner image
me - know about you
base_site - change base site
include_domain - set include domain
exclude_domain - set exclude domain
stats - Stats of the server and bot

Admin only use commands

batch -100XX - to convert link for multiple posts
logs - Send the log messages
restart - restart / re-deploy the server
ban - to ban users
unban - to unban users
info - get user info
```

## About

### Features

- [x] Shortener
- [x] Adlinkfly
- [x] Channels Support
- [x] Batch Support
- [x] Multiple Methods Available
- [x] Bypass Shortener Links
- [x] [Hyperlink Support](https://example.com/)
- [x] [Request Features](https://support.briceka.com/)

### Required Variables

| Variable Name              | Value                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_ID` (required)        | Telegram api_id obtained from <https://my.telegram.org/apps>.                                                                                                  |
| `API_HASH` (required)      | Telegram api_hash obtained from <https://my.telegram.org/apps>.                                                                                                |
| `BOT_TOKEN` (required)     | Create a bot using @BotFather, and get the Telegram API token.                                                                                                 |
| `ADMINS`                   | ID of Admins. Separate multiple Admins by comma                                                                                                                |
| `OWNER_ID` (required)      | ID of Owner.                                                                                                                                                   |
| `DATABASE_URL` (required)  | [mongoDB](https://www.mongodb.com) URI. Get this value from [mongoDB](https://www.mongodb.com). |
| `DATABASE_NAME` (required) | Name of the database in [mongoDB](https://www.mongodb.com).   |

### Optional Variables

> For more information about optional variables see the [wiki documentation](https://github.com/kariuki727/adlinkbot/wiki/About#optional-variables)

## Deploy

You can deploy this bot anywhere.

|                                                        | Name                 | Deploy                                                                                                                                                                                                                             |
| ------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Replit](assets/img/replit.jpg)                       | Replit (Recommended) | [See Guide](/guides/replit.md)                                                                                                                                                                                                     |
| [![Heroku](assets/img/heroku.png)](https://heroku.com) | Heroku               | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/kariuki727/adlinkbot)                                                                                      |
| ![Koyeb](assets/img/koyeb.png)                         | Koyeb                | [![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/apps/deploy?type=git&repository=kariuki727/adlinkbot-v2&name=url-shortener-v2&run_command=python3%20-m%20main&branch=main) |
| ![VPS](assets/img/vps.png)                             | VPS                  | [See Guide](/guides/vps.md)                                                                                                                                                                                                        |

## Tech Stack

**Language:** [Python](https://www.python.org/) 3.10.2

**Library:** [Pyrogram](https://github.com/pyrogram/pyrogram) 2.0.30

## Support

Contact Our [DEV](https://support.briceka.com/) For Support/Assistance

Report Bugs, Give Feature Requests There..  
Do Fork And Star The Repository If You Liked It.

## Disclaimer

[![GNU Affero General Public License v3.0](https://www.gnu.org/graphics/agplv3-155x51.png)](https://www.gnu.org/licenses/agpl-3.0.en.html#header)  
Licensed under [GNU AGPL v3.0.](LICENSE)
Selling The Codes To Other People For Money Is _Strictly Prohibited_.

## Credits

### **Developed with ❤️ by [KARIUKI](https://github.com/kariuki727)**
**Sponsored by [Briceka Enterprise](https://bricekainc.github.io/)**

