console.log("🚀 NEW CODE IS RUNNING");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("READY EVENT FIRED");
});

client.on("messageCreate", (message) => {
  console.log("MESSAGE EVENT FIRED:", message.content);
});

console.log("SCRIPT STARTED");

client.login(process.env.DISCORD_TOKEN);
