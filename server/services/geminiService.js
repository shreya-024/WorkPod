import { GoogleGenerativeAI } from '@google/generative-ai';

// gemini-2.0-flash free-tier quota is often 0; 2.5-flash is the current GA free-tier model
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Guardrails to enforce simulation boundaries and prevent off-topic behavior
const GUARDRAIL = `
STRICT RULES — NEVER BREAK THESE:
- Only respond to topics directly related to the current workplace simulation (tasks, deadlines, team communication, work updates)
- If user says anything off-topic (personal questions, general knowledge, "are you an AI", anything unrelated to work), respond in character: **[use the manager's name for this role]**: Hey, let's stay on track — sprint doesn't wait! 
- Never acknowledge being an AI or a simulation
- Never discuss politics, other companies, personal life, or anything outside this workplace scenario
- Max 3 lines per persona response
- Only one persona speaks per response unless a natural handoff occurs`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Chat model: short replies, 300 tokens is enough for 3-line persona responses
const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    maxOutputTokens: 300,
    temperature: 0.85,
  },
});

// Evaluator model: needs more tokens to output the full JSON report (feedback + roadmap)
const evaluatorModel = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    maxOutputTokens: 1500,
    temperature: 0.4,
  },
});

console.log(`[gemini] Using model: ${GEMINI_MODEL}`);

/**
 * Call Gemini with a conversation history.
 * systemPrompt is injected into the FIRST user turn (no system role).
 * History is trimmed to last 15 turns (30 messages) before calling.
 * GUARDRAIL is appended to systemPrompt to enforce simulation boundaries.
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

  // If this is the very first message (no history), prepend system prompt with guardrail
  let firstUserText = userMessage;
  if (trimmedHistory.length === 0 && systemPrompt) {
    const fullPrompt = `${systemPrompt}\n\n${GUARDRAIL}`;
    firstUserText = `${fullPrompt}\n\n---\n\n${userMessage}`;
  }

  const chat = model.startChat({ history: trimmedHistory });
  const result = await chat.sendMessage(firstUserText);
  const text = result.response.text();
  return text;
}

function buildMentorPrompt(scenario) {
  const mentorName = scenario.mentorName || 'Team Lead';
  const mentorRole = scenario.mentorRole || 'Mentor';
  const tasks = (scenario.tasks || [])
    .map((t) => `- ${t.title}${t.meta ? ` (${t.meta})` : ''}`)
    .join('\n');

  const basePrompt = scenario.mentorPrompt || `You are ${mentorName}, the ${mentorRole} for ${scenario.teamName} (${scenario.label} simulation).
Your job is to guide the user when they ask doubts about project context, priorities, trade-offs, and next steps.
Be practical, concise, and supportive.
Always stay within this simulation context and tasks:
${tasks}

Response format:
**[${mentorName}]**: <guidance>
Max 4 lines.`;

  return `${basePrompt}\n\n${GUARDRAIL}`;
}

/**
 * Mentor chat channel for user doubts and clarifications.
 * Keeps a separate history from teammate channel.
 */
export async function callMentorGemini(history, userMessage, scenario) {
  const mentorSystemPrompt = buildMentorPrompt(scenario);
  return callGemini(history, userMessage, history.length === 0 ? mentorSystemPrompt : null);
}

/**
 * Evaluate a session transcript and return a structured score JSON.
 * Uses strict guardrails and JSON enforcement to ensure valid evaluation output.
 */
export async function evaluateSession({ role, messages, tasksCompleted, emergencyTriggered, durationSeconds }) {
  const transcript = messages
    .filter(m => m.senderType !== 'system')
    .map(m => `[${m.senderType === 'user' ? 'User' : m.sender}]: ${m.content}`)
    .join('\n');

  const evaluatorGuardrail = `${GUARDRAIL}
- You are ONLY evaluating the work simulation session — never break character or the simulation frame
- Return ONLY valid JSON, no markdown, no backticks, no extra text`;

  const prompt = `You are an expert workplace performance evaluator. Analyze the following work simulation transcript and return ONLY a valid JSON object (no markdown, no explanation).

${evaluatorGuardrail}

Role: ${role.toUpperCase()}
Tasks completed: ${tasksCompleted.length}/4
Emergency handled: ${emergencyTriggered ? 'Yes' : 'No'}
Session duration: ${Math.floor(durationSeconds / 60)} minutes

Transcript:
${transcript.slice(0, 8000)}

  Return this exact JSON structure with ONLY these fields (no extra text, no markdown, no backticks):
{
  "overallScore": <0-100 integer>,
  "communication": <0-100 integer>,
  "taskManagement": <0-100 integer>,
  "pressureHandling": <0-100 integer>,
  "feedback": ["<specific feedback point 1>", "<specific feedback point 2>", "<specific feedback point 3>"],
  "roadmap": [
    { "title": "<skill/resource name>", "link": "<https://... real resource URL>", "description": "<one line why this helps>" },
    { "title": "<skill/resource name>", "link": "<https://... real resource URL>", "description": "<one line why this helps>" },
    { "title": "<skill/resource name>", "link": "<https://... real resource URL>", "description": "<one line why this helps>" }
  ]
}`;

  const result = await evaluatorModel.generateContent(prompt);
  const raw = result.response.text().trim();

  // Robustly extract the outermost JSON object, regardless of surrounding text or fences
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error(`No JSON object found in Gemini response: ${raw.slice(0, 200)}`);
  }
  const cleaned = raw.slice(jsonStart, jsonEnd + 1);
  return JSON.parse(cleaned);
}