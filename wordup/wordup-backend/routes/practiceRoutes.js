import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// In-memory storage (replace with database later)
let practiceHistory = [];

// Save practice session
router.post("/save", authMiddleware, (req, res) => {
  try {
    const { transcript, feedback, wordCount, sentenceCount } = req.body;
    
    const session = {
      id: Date.now(),
      userId: req.user.id,
      transcript,
      feedback,
      wordCount,
      sentenceCount,
      date: new Date().toISOString(),
    };

    practiceHistory.push(session);

    res.json({
      success: true,
      message: "Practice session saved!",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving practice session",
      error: error.message,
    });
  }
});

// Get user's practice history
router.get("/history", authMiddleware, (req, res) => {
  try {
    const userSessions = practiceHistory.filter(
      (session) => session.userId === req.user.id
    );

    res.json({
      success: true,
      sessions: userSessions.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching practice history",
      error: error.message,
    });
  }
});

// Delete a practice session
router.delete("/delete/:id", authMiddleware, (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const index = practiceHistory.findIndex(
      (session) => session.id === sessionId && session.userId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    practiceHistory.splice(index, 1);

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting session",
      error: error.message,
    });
  }
});

export default router;