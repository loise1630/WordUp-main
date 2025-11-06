import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PracticeSession from '../models/PracticeSession.js';
import Speech from '../models/Speech.js';

const router = express.Router();

// ⭐ GET overall progress summary
router.get('/overall', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const sessions = await PracticeSession.find({ userId })
      .sort({ practiceDate: -1 })
      .populate('speechId', 'title');

    if (sessions.length === 0) {
      return res.json({
        success: true,
        progress: {
          totalPractices: 0,
          difficultSentences: [],
          improvementTrend: []
        }
      });
    }

    // Calculate improvement trend (last 10 sessions)
    const improvementTrend = sessions.slice(0, 10).reverse().map((p, idx) => ({
      practice: idx + 1,
      score: p.score,
      date: p.practiceDate,
      wordsSpoken: p.wordCount
    }));

    // Get all flagged difficult sentences
    const difficultSentences = [];
    sessions.forEach(session => {
      session.sentenceResults?.forEach(sentence => {
        if (sentence.flaggedAsDifficult) {
          difficultSentences.push({
            text: sentence.sentenceText,
            sentenceIndex: sentence.sentenceIndex,
            attempts: sentence.attempts,
            bestScore: sentence.bestScore,
            lastScore: sentence.lastScore,
            notes: sentence.notes,
            speechTitle: session.speechId?.title || 'Unknown',
            speechId: session.speechId?._id,
            sessionId: session._id,
            lastPracticed: sentence.timestamp
          });
        }
      });
    });

    // Calculate overall stats
    const firstScore = sessions[sessions.length - 1].score;
    const latestScore = sessions[0].score;
    const improvement = latestScore - firstScore;

    res.json({
      success: true,
      progress: {
        totalPractices: sessions.length,
        firstScore: Math.round(firstScore),
        latestScore: Math.round(latestScore),
        improvement: Math.round(improvement),
        difficultSentences: difficultSentences.slice(0, 15), // Top 15
        improvementTrend
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ GET difficult sentences only
router.get('/difficult-sentences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const sessions = await PracticeSession.find({ userId })
      .populate('speechId', 'title');

    const difficultSentences = [];
    
    sessions.forEach(session => {
      session.sentenceResults?.forEach(sentence => {
        if (sentence.flaggedAsDifficult) {
          difficultSentences.push({
            _id: sentence._id,
            text: sentence.sentenceText,
            sentenceIndex: sentence.sentenceIndex,
            attempts: sentence.attempts,
            scores: sentence.scores,
            bestScore: sentence.bestScore,
            lastScore: sentence.lastScore,
            notes: sentence.notes,
            speechTitle: session.speechId?.title || 'Unknown Speech',
            speechId: session.speechId?._id,
            sessionId: session._id,
            lastPracticed: sentence.timestamp
          });
        }
      });
    });

    // Sort by most recently practiced
    difficultSentences.sort((a, b) => b.lastPracticed - a.lastPracticed);

    res.json({
      success: true,
      difficultSentences
    });

  } catch (error) {
    console.error('Error fetching difficult sentences:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ POST - Save/Update sentence practice result
router.post('/sentence-practice', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { 
      speechId, 
      sentenceText, 
      sentenceIndex, 
      score, 
      flagAsDifficult,
      notes 
    } = req.body;

    if (!sentenceText || score === undefined || sentenceIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Sentence text, index, and score are required'
      });
    }

    // Find today's practice session for this speech (or create new one)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let session = await PracticeSession.findOne({
      userId,
      speechId: speechId || null,
      practiceDate: { $gte: todayStart }
    });

    if (!session) {
      // Create new session for sentence practice
      session = new PracticeSession({
        userId,
        speechId: speechId || null,
        transcript: sentenceText,
        score: score,
        wordCount: sentenceText.split(' ').length,
        sentenceCount: 1,
        sentenceResults: []
      });
    }

    // Find or create sentence result
    let sentenceResult = session.sentenceResults.find(
      s => s.sentenceIndex === sentenceIndex
    );

    if (sentenceResult) {
      // Update existing
      sentenceResult.attempts += 1;
      sentenceResult.scores.push(score);
      sentenceResult.lastScore = score;
      sentenceResult.bestScore = Math.max(sentenceResult.bestScore, score);
      sentenceResult.timestamp = new Date();
      if (flagAsDifficult !== undefined) {
        sentenceResult.flaggedAsDifficult = flagAsDifficult;
      }
      if (notes) {
        sentenceResult.notes = notes;
      }
    } else {
      // Add new
      session.sentenceResults.push({
        sentenceText,
        sentenceIndex,
        attempts: 1,
        scores: [score],
        bestScore: score,
        lastScore: score,
        flaggedAsDifficult: flagAsDifficult || false,
        notes: notes || '',
        timestamp: new Date()
      });
    }

    await session.save();

    res.json({
      success: true,
      message: 'Sentence practice saved',
      sentenceResult: session.sentenceResults[session.sentenceResults.length - 1]
    });

  } catch (error) {
    console.error('Error saving sentence practice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ GET - Compare progress for specific speech
router.get('/compare/:speechId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const sessions = await PracticeSession.find({
      userId,
      speechId: req.params.speechId
    }).sort({ practiceDate: 1 });

    if (sessions.length === 0) {
      return res.json({
        success: true,
        comparison: { noData: true }
      });
    }

    const firstScore = sessions[0].score;
    const latestScore = sessions[sessions.length - 1].score;
    const improvement = latestScore - firstScore;

    const allScores = sessions.map(p => ({
      score: p.score,
      date: p.practiceDate,
      wordsSpoken: p.wordCount,
      fillers: p.fillerWordCount
    }));

    // Aggregate sentence-level progress
    const sentenceMap = new Map();
    sessions.forEach(session => {
      session.sentenceResults?.forEach(sentence => {
        const key = sentence.sentenceIndex;
        if (!sentenceMap.has(key)) {
          sentenceMap.set(key, {
            text: sentence.sentenceText,
            index: sentence.sentenceIndex,
            attempts: [],
            flagged: sentence.flaggedAsDifficult
          });
        }
        sentenceMap.get(key).attempts.push({
          score: sentence.lastScore,
          date: sentence.timestamp
        });
      });
    });

    const sentenceProgress = Array.from(sentenceMap.values());

    res.json({
      success: true,
      comparison: {
        totalAttempts: sessions.length,
        firstScore: Math.round(firstScore),
        latestScore: Math.round(latestScore),
        improvement: Math.round(improvement),
        allScores,
        sentenceProgress
      }
    });

  } catch (error) {
    console.error('Error comparing progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ PUT - Update sentence flags/notes
router.put('/sentence/:sessionId/:sentenceId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { sessionId, sentenceId } = req.params;
    const { flagAsDifficult, notes } = req.body;

    const session = await PracticeSession.findOne({
      _id: sessionId,
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const sentence = session.sentenceResults.id(sentenceId);
    if (!sentence) {
      return res.status(404).json({
        success: false,
        error: 'Sentence not found'
      });
    }

    if (flagAsDifficult !== undefined) {
      sentence.flaggedAsDifficult = flagAsDifficult;
    }
    if (notes !== undefined) {
      sentence.notes = notes;
    }

    await session.save();

    res.json({
      success: true,
      message: 'Sentence updated',
      sentence
    });

  } catch (error) {
    console.error('Error updating sentence:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;