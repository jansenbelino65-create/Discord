const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// OpenAI setup
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a friendly Discord AI bot. Keep replies short and helpful."
        },
        {
          role: "user",
          content: message.content
        }
      ]
    });

    const reply = response.choices[0].message.content;
    message.reply(reply);

  } catch (err) {
    console.error("AI error:", err);
    message.reply("AI is currently having trouble.");
  }
});

client.login(process.env.DISCORD_TOKEN);
