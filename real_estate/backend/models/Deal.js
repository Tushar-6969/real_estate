import mongoose from 'mongoose'

const dealSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stage: {
    type: String,
    enum: ['Inquiry', 'Negotiation', 'Agreement', 'Closed'],
    default: 'Inquiry',
  },
  amount: { type: Number, required: true },
  commissionRate: { type: Number, default: 2.5 },
  commission: { type: Number },
  documents: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
})

dealSchema.pre('save', function (next) {
  if (this.amount != null && this.commissionRate != null) {
    this.commission = Number(((this.amount * this.commissionRate) / 100).toFixed(2))
  }
  next()
})

export default mongoose.model('Deal', dealSchema)
