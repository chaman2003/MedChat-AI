/**
 * Chat Controller
 * Handles chat-related HTTP requests
 */
const { handleChat } = require("../../services/chat.service");

/**
 * POST /api/chat
 * Main chat endpoint for RAG-based medical queries
 */
async function chat(req, res, next) {
  try {
    const { question, role, user_id, patient_id } = req.body;

    console.log(`[API] Chat: "${question}", Role: ${role}, User: ${user_id}`);

    const result = await handleChat({
      question,
      role,
      user_id,
      patient_id,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chat,
};
