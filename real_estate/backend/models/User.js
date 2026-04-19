import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'agent', 'manager'],
    default: 'agent',
  },
  emailNotifications: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('User', userSchema)
