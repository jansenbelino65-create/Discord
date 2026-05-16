const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

async function askGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful Discord AI assistant. Keep replies short and friendly."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await res.json();

  console.log("GROQ RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    return `Groq API Error: ${data.error?.message || "Unknown error"}`;
  }

  return data.choices?.[0]?.message?.content || "No response.";
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.users.has(client.user.id);

  let isReplyToBot = false;
  if (message.reference) {
    try {
      const ref = await message.fetchReference();
      if (ref.author.id === client.user.id) {
        isReplyToBot = true;
      }
    } catch {}
  }

  if (!isMentioned && !isReplyToBot) return;

  try {
    const reply = await askGroq(message.content);
    await message.reply(reply);
  } catch (err) {
    console.error("Reply error:", err);
    message.reply("AI error.");
  }
});

client.login(process.env.DISCORD_TOKEN);
