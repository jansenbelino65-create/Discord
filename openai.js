const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateReply(history, message) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful Discord bot." },
      { role: "user", content: message }
    ]
  });

  return res.choices[0].message.content;
}

module.exports = { generateReply };
