const { Client, GatewayIntentBits } = require("discord.js");
const { generateReply } = require("./openai"); // your AI file

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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const reply = await generateReply(
      [],
      message.content
    );

    message.reply(reply);
  } catch (err) {
    console.error(err);
    message.reply("Sorry, something went wrong.");
  }
});

client.login(process.env.DISCORD_TOKEN);