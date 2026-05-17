const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Temporary conversations
const conversations = new Map();

// Forget conversations after 1 hour
const MEMORY_TIMEOUT = 1000 * 60 * 60;

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

// Detect topic resets
function isNewTopic(message) {
  const keywords = [
    "new topic",
    "anyway",
    "different question",
    "another question",
    "off topic"
  ];

  return keywords.some(word =>
    message.toLowerCase().includes(word)
  );
}

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

  if (!res.ok) {
    console.error("Groq Error:", data);
    return "AI error.";
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

  // Only respond if tagged or replied to
  if (!isMentioned && !isReplyToBot) return;

  // Memory only for:
  // server + channel + user
  const memoryKey =
    `${message.guild?.id || "dm"}-${message.channel.id}-${message.author.id}`;

  const now = Date.now();

  // Forget after timeout
  if (
    conversations.has(memoryKey) &&
    now - conversations.get(memoryKey).lastUsed > MEMORY_TIMEOUT
  ) {
    conversations.delete(memoryKey);
  }

  // Create fresh conversation
  if (!conversations.has(memoryKey)) {
    conversations.set(memoryKey, {
      lastUsed: now,
      history: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant similar to ChatGPT. Be friendly, direct, natural, and concise. Do not pretend to know personal information unless the user directly said it in the current conversation. Stay on-topic and avoid unnecessary roleplay."
        }
      ]
    });
  }

  const convo = conversations.get(memoryKey);

  convo.lastUsed = now;

  // Reset on topic change
  if (isNewTopic(message.content)) {
    convo.history = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant similar to ChatGPT. Be friendly, direct, natural, and concise."
      }
    ];
  }

  // Add ONLY the message content
  convo.history.push({
    role: "user",
    content: message.content
  });

  // Keep memory small and focused
  if (convo.history.length > 10) {
    convo.history.splice(1, convo.history.length - 10);
  }

  try {
    const reply = await askGroq(convo.history);

    convo.history.push({
      role: "assistant",
      content: reply
    });

    await message.reply(reply);

  } catch (err) {
    console.error("Reply Error:", err);
    message.reply("AI error.");
  }
});

client.login(process.env.DISCORD_TOKEN);
