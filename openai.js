import OpenAI from "openai";

const apiKey =
  process.env.OPENAI_API_KEY ??
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!apiKey) throw new Error("OPENAI_API_KEY must be set.");

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? undefined;
export const openai = new OpenAI({ apiKey, baseURL });

const MODEL = "gpt-4o-mini";

function buildSystemPrompt(profileNotes: string): string {
  const memory = profileNotes
    ? `\n\nWhat you remember about this user:\n${profileNotes}`
    : "";
  return `You are a friendly, helpful Discord assistant. You remember each user across conversations.
- Be warm, conversational, and genuinely helpful
- Keep responses short for Discord (under ~1800 chars) unless asked for detail
- Use markdown where it helps
- If you don't know something, say so honestly${memory}`;
}

export async function generateReply(history: any[], newUserMessage: string, profileNotes = ""): Promise<string> {
  const messages: any[] = [
    { role: "system", content: buildSystemPrompt(profileNotes) },
    ...history.map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: newUserMessage },
  ];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await openai.chat.completions.create({ model: MODEL, max_tokens: 1024, messages }, { signal: AbortSignal.timeout(30_000) });
      return res.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    } catch (err) {
      console.error(`OpenAI attempt ${attempt} failed:`, err);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  return "Sorry, I'm having trouble right now. Try again!";
}

export async function updateProfileNotes(history: any[], existingNotes: string): Promise<string> {
  const recent = history.slice(-20);
  if (recent.length < 2) return existingNotes;
  const transcript = recent.map((m: any) => `${m.role}: ${m.content}`).join("\n");
  try {
    const res = await openai.chat.completions.create(
      { model: MODEL, max_tokens: 256, messages: [
        { role: "system", content: "Extract key facts about this user as bullet points. If nothing new, return existing notes." },
        { role: "user", content: `Existing:\n${existingNotes || "(none)"}\n\nConversation:\n${transcript}\n\nUpdated notes:` },
      ]},
      { signal: AbortSignal.timeout(15_000) }
    );
    return res.choices[0]?.message?.content?.trim() ?? existingNotes;
  } catch { return existingNotes; }
}