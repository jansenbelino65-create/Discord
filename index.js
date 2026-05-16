const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("Bot is online");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // ONLY reply when bot is tagged
  if (!message.mentions.has(client.user)) return;

  message.reply("I am online 🤖");
});

client.login(process.env.DISCORD_TOKEN);
