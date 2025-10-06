import mongoose from 'mongoose'

const documentGroupAssociationSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentGroup', required: true },
  createdAt: { type: Date, default: Date.now }
})

// Create a compound index to ensure uniqueness
documentGroupAssociationSchema.index({ documentId: 1, groupId: 1 }, { unique: true })

export const DocumentGroupAssociation = mongoose.model('DocumentGroupAssociation', documentGroupAssociationSchema) 