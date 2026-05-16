const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Store conversations
const conversations = new Map();

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

async function askGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages
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

  const userId = message.author.id;

  // Create memory if user doesn't exist
  if (!conversations.has(userId)) {
    conversations.set(userId, [
      {
        role: "system",
        content:
          "You are a helpful Discord AI assistant. Remember the user's name and continue conversations naturally."
      }
    ]);
  }

  const history = conversations.get(userId);

  // Add user message
  history.push({
    role: "user",
    content: `${message.author.username}: ${message.content}`
  });

  // Keep memory from getting too huge
  if (history.length > 20) {
    history.splice(1, history.length - 20);
  }

  try {
    const reply = await askGroq(history);

    // Save AI reply
    history.push({
      role: "assistant",
      content: reply
    });

    await message.reply(reply);

  } catch (err) {
    console.error("Reply error:", err);
    message.reply("AI error.");
  }
});

client.login(process.env.DISCORD_TOKEN);
