/**
 * LLM Service
 * Integration with Groq LLM for natural language generation
 */
const config = require("../config");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE) || 0;
const MAX_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS) || 1024;

const SYSTEM_PROMPT = `You are a medical assistant. Answer questions accurately based ONLY on the patient data provided. Be concise and professional. If information is not available in the data, say so clearly.`;

/**
 * Call Groq LLM API
 * @param {string} prompt - User prompt with context
 * @param {string} systemPrompt - Optional custom system prompt
 */
async function callGroq(prompt, systemPrompt = SYSTEM_PROMPT) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groq.API_KEY}`,
    },
    body: JSON.stringify({
      model: config.groq.MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate chat response with structured prompt
 */
async function generateChatResponse(prompt) {
  return callGroq(prompt);
}

module.exports = {
  callGroq,
  generateChatResponse,
  SYSTEM_PROMPT,
};
