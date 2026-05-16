const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

async function askGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful Discord AI assistant. Keep replies short and natural."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response.";
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.users.has(client.user.id);

  let isReplyToBot = false;
  if (message.reference) {
    try {
      const refMsg = await message.fetchReference();
      if (refMsg.author.id === client.user.id) {
        isReplyToBot = true;
      }
    } catch {}
  }

  if (!isMentioned && !isReplyToBot) return;

  try {
    const reply = await askGroq(message.content);
    message.reply(reply);
  } catch (err) {
    console.error(err);
    message.reply("AI error.");
  }
});

client.login(process.env.DISCORD_TOKEN);
