import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  provider: { type: String, default: 'google', enum: ['google', 'local'] },
  passwordHash: { type: String, default: null }, // for local auth if needed later
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
