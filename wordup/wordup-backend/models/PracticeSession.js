import mongoose from 'mongoose';

const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speechId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Speech',
    default: null
  },
  transcript: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  fillerWordCount: {
    type: Number,
    default: 0
  },
  sentenceCount: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  
  // ⭐ ADD THESE NEW FIELDS FOR SENTENCE TRACKING ⭐
  sentenceResults: [{
    sentenceText: String,
    sentenceIndex: Number,
    attempts: {
      type: Number,
      default: 1
    },
    scores: [Number],
    bestScore: Number,
    lastScore: Number,
    flaggedAsDifficult: {
      type: Boolean,
      default: false
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ⭐ ADD GRAMMAR & VOCABULARY TRACKING ⭐
  grammarIssues: [{
    issue: String,
    suggestion: String,
    sentence: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  
  vocabularyLearned: [{
    word: String,
    definition: String,
    usage: String,
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  
  practiceDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PracticeSession', practiceSessionSchema);