// Groq LLM Integration
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL
const GROQ_TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE) || 0;
const GROQ_MAX_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS) || 1024;

async function callGroq(prompt) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a medical assistant. Answer questions accurately based ONLY on the patient data provided. Be concise and professional. If information is not available in the data, say so clearly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: GROQ_TEMPERATURE,
      max_tokens: GROQ_MAX_TOKENS
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { callGroq };
