import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
  text: String,
  pageNumber: Number,
  imageUrl: String
}, { _id: false })

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  pageNumber: Number
}, { _id: false })

const documentSchema = new mongoose.Schema({
  title: String,
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ['html', 'pdf'] },
  content: String,
  extractedText: String,
  chunks: [String], // Legacy format
  chunkObjects: [chunkSchema], // New format with embeddings
  pages: [pageSchema],
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Virtual for group associations
documentSchema.virtual('groups', {
  ref: 'DocumentGroupAssociation',
  localField: '_id',
  foreignField: 'documentId'
})

// Set to use virtuals when converting to JSON
documentSchema.set('toJSON', { virtuals: true })
documentSchema.set('toObject', { virtuals: true })

// Update the updatedAt field on save
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const Document = mongoose.model('Document', documentSchema)