import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential' },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String },
  amenities: [String],
  description: { type: String },
  images: [String],
  status: {
    type: String,
    enum: ['Available', 'Under Offer', 'Sold'],
    default: 'Available',
  },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Property', propertySchema)
