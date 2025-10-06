import express, { Request, Response } from 'express'
import { 
  getRootGroups, 
  getGroupById, 
  createGroup,
  updateGroup,
  deleteGroup,
  addDocumentToGroup,
  removeDocumentFromGroup,
  getDocumentGroups,
  searchGroups,
  searchDocuments
} from '../service/documentGroupService.js'

const router = express.Router()

// Get root groups
router.get('/', async (req: Request, res: Response) => {
  try {
    const groups = await getRootGroups()
    res.json(groups)
  } catch (error) {
    console.error('Error fetching root groups:', error)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// Get a specific group
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const group = await getGroupById(req.params.id)
    res.json(group)
  } catch (error: any) {
    console.error(`Error fetching group ${req.params.id}:`, error)
    res.status(404).json({ error: `Group not found: ${error.message}` })
  }
})

// Create a new group
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, parentId } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' })
    }
    
    const group = await createGroup(name, description, parentId)
    res.status(201).json(group)
  } catch (error: any) {
    console.error('Error creating group:', error)
    res.status(400).json({ error: `Failed to create group: ${error.message}` })
  }
})

// Update a group
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, parentId } = req.body
    const group = await updateGroup(req.params.id, { name, description, parentId })
    res.json(group)
  } catch (error: any) {
    console.error(`Error updating group ${req.params.id}:`, error)
    res.status(400).json({ error: `Failed to update group: ${error.message}` })
  }
})

// Delete a group
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { reassignToGroupId } = req.query
    await deleteGroup(req.params.id, reassignToGroupId as string || null)
    res.status(204).end()
  } catch (error: any) {
    console.error(`Error deleting group ${req.params.id}:`, error)
    res.status(400).json({ error: `Failed to delete group: ${error.message}` })
  }
})

// Add document to group
router.post('/:groupId/documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { groupId, documentId } = req.params
    const result = await addDocumentToGroup(documentId, groupId)
    res.status(201).json(result)
  } catch (error: any ) {
    console.error(`Error adding document ${req.params.documentId} to group ${req.params.groupId}:`, error)
    res.status(400).json({ error: `Failed to add document to group: ${error.message}` })
  }
})

// Remove document from group
router.delete('/:groupId/documents/:documentId', async (req: Request, res: Response) => {
  try {
    const { groupId, documentId } = req.params
    const result = await removeDocumentFromGroup(documentId, groupId)
    
    if (result) {
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Document not found in this group' })
    }
  } catch (error: any) {
    console.error(`Error removing document ${req.params.documentId} from group ${req.params.groupId}:`, error)
    res.status(400).json({ error: `Failed to remove document from group: ${error.message}` })
  }
})

// Get all groups for a document
router.get('/document/:documentId', async (req: Request, res: Response) => {
  try {
    const groups = await getDocumentGroups(req.params.documentId)
    res.json(groups)
  } catch (error: any) {
    console.error(`Error fetching groups for document ${req.params.documentId}:`, error)
    res.status(500).json({ error: 'Failed to fetch document groups' })
  }
})

// Search for groups
router.get('/search/groups', async (req: Request, res: Response) => {
  try {
    const { query } = req.query
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' })
    }
    
    const groups = await searchGroups(query)
    res.json(groups)
  } catch (error: any) {
    console.error('Error searching groups:', error)
    res.status(500).json({ error: 'Failed to search groups' })
  }
})

// Search for documents
router.get('/search/documents', async (req: Request, res: Response) => {
  try {
    const { query, type, groupId } = req.query
    
    const documents = await searchDocuments({
      query: query as string,
      type: type as 'html' | 'pdf',
      groupId: groupId as string
    })
    
    res.json(documents)
  } catch (error: any) {
    console.error('Error searching documents:', error)
    res.status(500).json({ error: 'Failed to search documents' })
  }
})

export { router as documentGroupsRouter } 