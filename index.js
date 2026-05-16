const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("BOT ONLINE");
});

client.on("messageCreate", async (message) => {
  console.log("GOT MESSAGE");

  try {
    const sent = await message.channel.send("✅ BOT CAN SEND MESSAGES");
    console.log("MESSAGE SENT:", sent.content);
  } catch (err) {
    console.error("SEND ERROR:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
