import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// In-memory storage (replace with database later)
let practiceHistory = [];

// Save practice session
router.post("/save", authMiddleware, (req, res) => {
  try {
    const { transcript, feedback, wordCount, sentenceCount } = req.body;
    
    // Handle different token formats
    const userId = req.user.id || req.user.userId || req.user._id;
    
    const session = {
      id: Date.now(),
      userId: userId,
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
    console.error("❌ Save Error:", error);
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
    // Handle different token formats
    const userId = req.user.id || req.user.userId || req.user._id;
    
    console.log("🔍 User ID:", userId);
    console.log("📊 Total sessions:", practiceHistory.length);
    
    const userSessions = practiceHistory.filter(
      (session) => session.userId === userId
    );

    console.log("✅ User sessions found:", userSessions.length);

    res.json({
      success: true,
      sessions: userSessions.reverse(),
    });
  } catch (error) {
    console.error("❌ History Error:", error);
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
    const userId = req.user.id || req.user.userId || req.user._id;
    
    const index = practiceHistory.findIndex(
      (session) => session.id === sessionId && session.userId === userId
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
    console.error("❌ Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting session",
      error: error.message,
    });
  }
});

export default router;