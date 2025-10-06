import mongoose from 'mongoose'
import { broadcastJobUpdate } from '../index.js'

const jobSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ['html', 'pdf'] },
  status: { type: String, required: true, enum: ['pending', 'processing', 'done', 'error'], default: 'pending' },
  progress: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field on save and broadcast updates
jobSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Broadcast updates after save
jobSchema.post('save', function() {
  broadcastJobUpdate(this._id.toString()).catch(console.error)
})

export const Job = mongoose.model('Job', jobSchema)