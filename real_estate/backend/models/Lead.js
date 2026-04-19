import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  budget: { type: Number },
  preferences: { type: String },
  source: { type: String, default: 'website' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'],
    default: 'New',
  },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followUps: [
    {
      date: Date,
      note: String,
      completed: { type: Boolean, default: false },
    },
  ],
  reminders: [
    {
      date: Date,
      note: String,
      completed: { type: Boolean, default: false },
    },
  ],
  notes: String,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Lead', leadSchema)
