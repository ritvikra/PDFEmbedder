import { DocumentGroup } from '../db/documentGroup';
import { DocumentGroupAssociation } from '../db/documentGroupAssociation';
import { Document } from '../db/document';
import mongoose from 'mongoose';

// Get all root groups (those without a parent)
export const getRootGroups = async () => {
  return await DocumentGroup.find({ parentId: null })
    .populate('children')
    .sort({ name: 1 });
};

// Get a specific group by ID with its children and documents
export const getGroupById = async (groupId: string) => {
  const group = await DocumentGroup.findById(groupId)
    .populate('children')
    .populate({
      path: 'documents',
      populate: {
        path: 'documentId',
        model: 'Document'
      }
    });
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  return group;
};

// Create a new group
export const createGroup = async (name: string, description: string = '', parentId: string | null = null) => {
  // Validate parent exists if provided
  if (parentId) {
    const parentExists = await DocumentGroup.findById(parentId);
    if (!parentExists) {
      throw new Error(`Parent group with ID ${parentId} not found`);
    }
  }
  
  return await DocumentGroup.create({
    name,
    description,
    parentId: parentId || null
  });
};

// Update a group
export const updateGroup = async (groupId: string, updateData: { name?: string, description?: string, parentId?: string | null }) => {
  // Validate parent exists if provided
  if (updateData.parentId) {
    const parentExists = await DocumentGroup.findById(updateData.parentId);
    if (!parentExists) {
      throw new Error(`Parent group with ID ${updateData.parentId} not found`);
    }
    
    // Prevent circular references
    if (updateData.parentId === groupId) {
      throw new Error('A group cannot be its own parent');
    }
    
    // Check that new parent is not a descendant of this group
    const isDescendant = await isGroupDescendant(updateData.parentId, groupId);
    if (isDescendant) {
      throw new Error('Cannot create circular group hierarchy');
    }
  }
  
  const group = await DocumentGroup.findByIdAndUpdate(
    groupId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  return group;
};

// Delete a group and reassign its documents
export const deleteGroup = async (groupId: string, reassignToGroupId: string | null = null) => {
  // Check if group exists
  const group = await DocumentGroup.findById(groupId);
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  // Get all children
  const children = await DocumentGroup.find({ parentId: groupId });
  
  try {
    // Reassign children to parent of deleted group or to null
    for (const child of children) {
      child.parentId = group.parentId;
      await child.save();
    }
    
    // Handle document associations
    if (reassignToGroupId) {
      // Validate reassign group exists
      const reassignGroup = await DocumentGroup.findById(reassignToGroupId);
      if (!reassignGroup) {
        throw new Error(`Reassign group with ID ${reassignToGroupId} not found`);
      }
      
      // Update associations to new group
      await DocumentGroupAssociation.updateMany(
        { groupId: groupId },
        { groupId: reassignToGroupId }
      );
    } else {
      // Delete all associations for this group
      await DocumentGroupAssociation.deleteMany({ groupId: groupId });
    }
    
    // Delete the group
    await DocumentGroup.findByIdAndDelete(groupId);
  } catch (error) {
    console.error('Error during group deletion:', error);
    throw error;
  }
  
  return true;
};

// Add document to group
export const addDocumentToGroup = async (documentId: string, groupId: string) => {
  // Validate document exists
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`);
  }
  
  // Validate group exists
  const group = await DocumentGroup.findById(groupId);
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }
  
  // Create association (will fail if already exists due to unique index)
  try {
    return await DocumentGroupAssociation.create({
      documentId,
      groupId
    });
  } catch (error: unknown) {
    // If error is duplicate key, return existing association
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return await DocumentGroupAssociation.findOne({
        documentId,
        groupId
      });
    }
    throw error;
  }
};

// Remove document from group
export const removeDocumentFromGroup = async (documentId: string, groupId: string) => {
  const result = await DocumentGroupAssociation.deleteOne({
    documentId,
    groupId
  });
  
  return result.deletedCount > 0;
};

// Get all groups for a document
export const getDocumentGroups = async (documentId: string) => {
  const associations = await DocumentGroupAssociation.find({ documentId })
    .populate('groupId');
  
  return associations.map(assoc => assoc.groupId);
};

// Search for groups
export const searchGroups = async (query: string) => {
  return await DocumentGroup.find({
    name: { $regex: query, $options: 'i' }
  }).sort({ name: 1 });
};

// Search for documents with filters
export const searchDocuments = async (options: {
  query?: string,
  type?: 'html' | 'pdf',
  groupId?: string
}) => {
  let documentQuery: any = {};
  
  // Text search
  if (options.query) {
    documentQuery.$or = [
      { title: { $regex: options.query, $options: 'i' } },
      { url: { $regex: options.query, $options: 'i' } },
      { extractedText: { $regex: options.query, $options: 'i' } }
    ];
  }
  
  // Filter by type
  if (options.type) {
    documentQuery.type = options.type;
  }
  
  // Base query for documents
  let documents;
  
  // If group filter is applied
  if (options.groupId) {
    // Get document IDs in this group
    const associations = await DocumentGroupAssociation.find({ groupId: options.groupId });
    const documentIds = associations.map(assoc => assoc.documentId);
    
    // Add to query
    documentQuery._id = { $in: documentIds };
  }
  
  // Execute query
  documents = await Document.find(documentQuery)
    .populate('jobId', 'status')
    .sort({ createdAt: -1 });
  
  return documents;
};

// Helper function to check if group is a descendant of another group
async function isGroupDescendant(childId: string, possibleAncestorId: string): Promise<boolean> {
  const child = await DocumentGroup.findById(childId);
  if (!child || !child.parentId) {
    return false;
  }
  
  if (child.parentId.toString() === possibleAncestorId) {
    return true;
  }
  
  return await isGroupDescendant(child.parentId.toString(), possibleAncestorId);
} 