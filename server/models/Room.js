import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  role: { type: String, enum: ['sde', 'hr', 'pm'], required: true },
  code: { type: String, required: true, unique: true },
  participants: [
    {
      userId: String, // real userId or guestId
      name: String,
      isGuest: Boolean,
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Room', RoomSchema);
