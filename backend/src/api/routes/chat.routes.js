/**
 * Chat Routes
 * POST /api/chat - Handle chat messages
 */
const { Router } = require("express");
const chatController = require("../controllers/chat.controller");

const router = Router();

// POST /api/chat - Send a chat message and get a response
router.post("/", chatController.chat);

module.exports = router;
