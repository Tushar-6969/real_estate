import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  type: { type: String, enum: ['Buyer', 'Seller'], default: 'Buyer' },
  preferences: String,
  history: [
    {
      date: { type: Date, default: Date.now },
      interaction: String,
      property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    },
  ],
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Client', clientSchema)
