import { getRoomParticipantCount } from '../socket/roomManager.js';

// GET /api/room/count/:role
export const getRoomCount = (req, res) => {
  const { role } = req.params;
  if (!['sde', 'hr', 'pm'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const count = getRoomParticipantCount(role);
  res.json({ role, count });
};
