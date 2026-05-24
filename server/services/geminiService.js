import { GoogleGenerativeAI } from '@google/generative-ai';

// gemini-2.0-flash free-tier quota is often 0; 2.5-flash is the current GA free-tier model
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    maxOutputTokens: 300,
    temperature: 0.85,
  },
});

console.log(`[gemini] Using model: ${GEMINI_MODEL}`);

/**
 * Call Gemini with a conversation history.
 * systemPrompt is injected into the FIRST user turn (no system role).
 * History is trimmed to last 15 turns (30 messages) before calling.
 *
 * @param {Array<{role:'user'|'model', parts:[{text:string}]}>} history
 * @param {string} userMessage - the new user message
 * @param {string|null} systemPrompt - injected only on first turn
 * @returns {Promise<string>} AI text response
 */
export async function callGemini(history, userMessage, systemPrompt = null) {
  // Trim to last 15 turns (each turn = one {role,parts} entry)
  const MAX_TURNS = 15;
  let trimmedHistory = history.length > MAX_TURNS
    ? history.slice(history.length - MAX_TURNS)
    : [...history];

  // If this is the very first message (no history), prepend system prompt
  let firstUserText = userMessage;
  if (trimmedHistory.length === 0 && systemPrompt) {
    firstUserText = `${systemPrompt}\n\n---\n\n${userMessage}`;
  }

  const chat = model.startChat({ history: trimmedHistory });
  const result = await chat.sendMessage(firstUserText);
  const text = result.response.text();
  return text;
}

/**
 * Evaluate a session transcript and return a structured score JSON.
 */
export async function evaluateSession({ role, messages, tasksCompleted, emergencyTriggered, durationSeconds }) {
  const transcript = messages
    .filter(m => m.senderType !== 'system')
    .map(m => `[${m.senderType === 'user' ? 'User' : m.sender}]: ${m.content}`)
    .join('\n');

  const prompt = `You are an expert workplace performance evaluator. Analyze the following work simulation transcript and return ONLY a valid JSON object (no markdown, no explanation).

Role: ${role.toUpperCase()}
Tasks completed: ${tasksCompleted.length}/4
Emergency handled: ${emergencyTriggered ? 'Yes' : 'No'}
Session duration: ${Math.floor(durationSeconds / 60)} minutes

Transcript:
${transcript.slice(0, 8000)}

Return this exact JSON structure:
{
  "overallScore": <0-100 integer>,
  "communication": <0-100 integer>,
  "taskManagement": <0-100 integer>,
  "pressureHandling": <0-100 integer>,
  "feedback": ["<specific feedback point 1>", "<specific feedback point 2>", "<specific feedback point 3>"],
  "roadmap": [
    { "title": "<skill title>", "description": "<1-sentence description>", "link": "<https://... real resource URL>" },
    { "title": "<skill title>", "description": "<1-sentence description>", "link": "<https://... real resource URL>" },
    { "title": "<skill title>", "description": "<1-sentence description>", "link": "<https://... real resource URL>" }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}