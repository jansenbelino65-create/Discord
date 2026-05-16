# Discord Bot 🤖

A simple Discord bot built with discord.js that responds to messages.

## Features

- Responds with "I am online 🤖" to any message
- Built with discord.js v14
- Environment-based configuration
- Ready for deployment on Railway

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jansenbelino65-create/Discord.git
cd Discord
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Discord bot token to `.env`:
```
DISCORD_TOKEN=your_token_here
```

## Running Locally

```bash
npm start
```

You should see:
```
Logged in as YourBotName#0000
```

## Deploying on Railway

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create a new project and connect your GitHub repo
4. Add environment variable `DISCORD_TOKEN` in Railway dashboard
5. Railway will automatically deploy and run your bot

## Getting Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to the "Bot" tab → "Add Bot"
4. Under TOKEN, click "Copy"
5. Paste it in your `.env` file

## Adding Bot to Your Server

1. In Developer Portal, go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: `Send Messages`, `Read Messages/View Channels`
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

## How It Works

The bot listens for messages and replies with "I am online 🤖" to any non-bot message.

## License

MIT
