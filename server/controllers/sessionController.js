import Session from '../models/Session.js';
import { evaluateSession } from '../services/geminiService.js';

// POST /api/session/end
export const endSession = async (req, res) => {
  try {
    const {
      userId,
      guestId,
      role,
      roomId,
      messages,
      tasksCompleted,
      emergencyTriggered,
      durationSeconds,
      totalTasks,
    } = req.body;

    if (!role || !roomId) {
      return res.status(400).json({ error: 'role and roomId are required' });
    }

    // Call Gemini evaluator
    let report;
    try {
      report = await evaluateSession({
        role,
        messages: messages || [],
        tasksCompleted: tasksCompleted || [],
        emergencyTriggered: !!emergencyTriggered,
        durationSeconds: durationSeconds || 0,
        totalTasks: totalTasks || 4,
      });
    } catch (geminiErr) {
      console.error('Evaluation error:', geminiErr.message);
      // Fallback report so the session doesn't fail entirely
      report = {
        overallScore: 60,
        communication: 60,
        taskManagement: (tasksCompleted?.length || 0) * 25,
        pressureHandling: emergencyTriggered ? 65 : 50,
        feedback: [
          'Session evaluation unavailable — Gemini API error.',
          'Your participation has been recorded.',
          'Try again for a detailed performance report.',
        ],
        roadmap: [],
      };
    }

    // Save to DB only for authenticated (non-guest) users
    const isRealUser = userId && !userId.startsWith('guest_');
    if (isRealUser) {
      await Session.create({
        userId,
        guestId: null,
        role,
        roomId,
        messages: messages || [],
        tasksCompleted: tasksCompleted || [],
        emergencyTriggered: !!emergencyTriggered,
        durationSeconds: durationSeconds || 0,
        score: {
          overallScore: report.overallScore,
          communication: report.communication,
          taskManagement: report.taskManagement,
          pressureHandling: report.pressureHandling,
          feedback: report.feedback || [],
          roadmap: report.roadmap || [],
        },
        report, // Full report object stored for reference
      });
    }

    res.json({ report, saved: isRealUser });
  } catch (err) {
    console.error('endSession error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/session/history/:userId (get past sessions for a user)
export const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const sessions = await Session.find({ userId })
      .select('-messages') // Exclude full message history to reduce payload
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
