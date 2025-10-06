import mongoose from 'mongoose'

const documentGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentGroup', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field on save
documentGroupSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for getting children (populated on query)
documentGroupSchema.virtual('children', {
  ref: 'DocumentGroup',
  localField: '_id',
  foreignField: 'parentId'
})

// Virtual for documents in this group (populated on query)
documentGroupSchema.virtual('documents', {
  ref: 'DocumentGroupAssociation',
  localField: '_id',
  foreignField: 'groupId'
})

// Set to use virtuals when converting to JSON
documentGroupSchema.set('toJSON', { virtuals: true })
documentGroupSchema.set('toObject', { virtuals: true })

export const DocumentGroup = mongoose.model('DocumentGroup', documentGroupSchema) 