import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRootGroups, getGroupById, createGroup, updateGroup, deleteGroup, addDocumentToGroup, removeDocumentFromGroup, getAllDocuments } from '../api';

interface Document {
  _id: string;
  url: string;
  type: string;
  status?: string;
  createdAt: string;
}

interface DocumentGroup {
  _id: string;
  name: string;
  description: string;
  parentId?: string;
  children: DocumentGroup[];
  documents: {
    _id: string;
    documentId: {
      _id: string;
      url: string;
      type: string;
    }
  }[];
}

const DocumentGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<DocumentGroup[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DocumentGroup | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);

  // Fetch root groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await getRootGroups();
      setGroups(groupsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load s. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const documentsData = await getAllDocuments();
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchDocuments();
  }, []);

  // Fetch group details when a group is selected
  const fetchGroupDetails = async (groupId: string) => {
    try {
      const groupData = await getGroupById(groupId);
      setSelectedGroup(groupData);
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError('Failed to load group details. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedGroup?._id) {
      fetchGroupDetails(selectedGroup._id);
    }
  }, [selectedGroup?._id]);

  // Handle creating a new group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      await createGroup({
        name: newGroupName,
        description: newGroupDescription,
        parentId: selectedGroup?._id || null
      });

      // Refresh the groups list to make sure we have the latest data
      await fetchGroups();
      
      // If we had a parent group selected, refresh its details to show the new child
      if (selectedGroup?._id) {
        await fetchGroupDetails(selectedGroup._id);
      }

      // Reset form
      setNewGroupName('');
      setNewGroupDescription('');
      setShowAddForm(false);
      setSuccess('Group created successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle updating a group
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupName.trim() || !selectedGroup) {
      setError('Group name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      await updateGroup(selectedGroup._id, {
        name: newGroupName,
        description: newGroupDescription
      });

      // Refresh the groups list
      await fetchGroups();
      
      // Refresh the selected group details
      await fetchGroupDetails(selectedGroup._id);

      // Reset form
      setIsEditing(false);
      setSuccess('Group updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Failed to update group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle deleting a group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the group "${selectedGroup.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      // Call the API function to delete the group
      await deleteGroup(selectedGroup._id);

      // Refresh the groups list
      await fetchGroups();
      
      // Clear the selected group
      setSelectedGroup(null);
      setSuccess('Group deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Start editing a group
  const startEditingGroup = () => {
    if (selectedGroup) {
      setNewGroupName(selectedGroup.name);
      setNewGroupDescription(selectedGroup.description || '');
      setIsEditing(true);
    }
  };

  // Cancel editing a group
  const cancelEditingGroup = () => {
    setIsEditing(false);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  // Add documents to the selected group
  const addDocumentsToGroup = async () => {
    if (!selectedGroup || selectedDocumentIds.length === 0) return;

    try {
      setIsAddingDocuments(true);
      setError(null);
      
      // Add each selected document to the group
      for (const docId of selectedDocumentIds) {
        await addDocumentToGroup(docId, selectedGroup._id);
      }

      // Refresh the selected group details
      await fetchGroupDetails(selectedGroup._id);
      
      // Close the modal and reset selected documents
      setShowAddDocumentModal(false);
      setSelectedDocumentIds([]);
      setSuccess('Documents added to group successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding documents to group:', err);
      setError('Failed to add documents to group. Please try again.');
    } finally {
      setIsAddingDocuments(false);
    }
  };

  // Remove a document from the selected group
  const removeDocumentFromSelectedGroup = async (documentId: string) => {
    if (!selectedGroup) return;

    try {
      await removeDocumentFromGroup(documentId, selectedGroup._id);
      
      // Refresh the selected group details
      await fetchGroupDetails(selectedGroup._id);
      setSuccess('Document removed from group successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing document from group:', err);
      setError('Failed to remove document from group. Please try again.');
    }
  };

  // Toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds(prevSelected => {
      if (prevSelected.includes(documentId)) {
        return prevSelected.filter(id => id !== documentId);
      } else {
        return [...prevSelected, documentId];
      }
    });
  };

  // Filter out documents that are already in the selected group
  const getAvailableDocuments = () => {
    if (!selectedGroup || !selectedGroup.documents) return documents;
    
    const groupDocIds = selectedGroup.documents.map(doc => doc.documentId._id);
    return documents.filter(doc => !groupDocIds.includes(doc._id));
  };

  // Render a group item with its children
  const renderGroupItem = (group: DocumentGroup, level = 0) => {
    return (
      <div key={group._id} className="mb-2">
        <div 
          className={`p-3 rounded-lg cursor-pointer mb-1 flex justify-between items-center ${selectedGroup?._id === group._id ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setSelectedGroup(group)}
        >
          <div className="flex items-center">
            <span className="text-gray-700 font-medium" style={{ marginLeft: `${level * 16}px` }}>
              {group.name}
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            {group.documents?.length || 0} documents
          </div>
        </div>
        
        {/* Render children recursively */}
        {group.children && group.children.length > 0 && (
          <div className="ml-4">
            {group.children.map(child => renderGroupItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Document Groups</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => setShowAddForm(true)}
          disabled={isCreating || isEditing}
        >
          Create New Group
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg">
          {success}
        </div>
      )}

      {loading && !groups.length ? (
        <div className="text-gray-600">Loading s...</div>
      ) : (
        <div className="grid grid-cols-[1fr_2fr] gap-6">
          {/* Left column: Group hierarchy */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Group Hierarchy</h2>
            
            {groups.length === 0 ? (
              <div className="text-gray-500">No document groups found. Create one to get started.</div>
            ) : (
              <div className="space-y-1">
                {groups.map(group => renderGroupItem(group))}
              </div>
            )}
          </div>

          {/* Right column: Selected group details or form */}
          <div className="bg-white p-6 rounded-lg border">
            {showAddForm ? (
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Create New Group {selectedGroup && `under "${selectedGroup.name}"`}
                </h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter group name"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter group description"
                      rows={3}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Group'}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewGroupName('');
                        setNewGroupDescription('');
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : isEditing && selectedGroup ? (
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Edit Group: {selectedGroup.name}
                </h2>
                <form onSubmit={handleUpdateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter group name"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter group description"
                      rows={3}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                      onClick={cancelEditingGroup}
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedGroup ? (
              <div>
                <div className="flex justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{selectedGroup.name}</h2>
                    {selectedGroup.description && (
                      <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
                      onClick={startEditingGroup}
                    >
                      Edit
                    </button>
                    <button 
                      className={`px-3 py-1 rounded border ${isDeleting 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                      onClick={handleDeleteGroup}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Documents in this group */}
                <div className="mt-8">
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-medium">Documents in this Group</h3>
                    <button
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
                      onClick={() => setShowAddDocumentModal(true)}
                    >
                      Add Documents
                    </button>
                  </div>
                  {!selectedGroup.documents || selectedGroup.documents.length === 0 ? (
                    <div className="text-gray-500">No documents in this group yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedGroup.documents.map(doc => (
                        <div key={doc._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{doc.documentId?.url || 'Unknown URL'}</p>
                              <p className="text-sm text-gray-500">Type: {doc.documentId?.type?.toUpperCase() || 'Unknown'}</p>
                            </div>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => removeDocumentFromSelectedGroup(doc.documentId._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Child groups */}
                {selectedGroup.children && selectedGroup.children.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Child Groups</h3>
                    <div className="space-y-2">
                      {selectedGroup.children.map(child => (
                        <div 
                          key={child._id} 
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedGroup(child)}
                        >
                          <p className="font-medium text-gray-800">{child.name}</p>
                          {child.description && (
                            <p className="text-sm text-gray-500">{child.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                <p>Select a group to view details or create a new group to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for adding documents */}
      {showAddDocumentModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-medium">Add Documents to "{selectedGroup.name}"</h2>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              {getAvailableDocuments().length === 0 ? (
                <p className="text-gray-500">No more documents available to add to this group.</p>
              ) : (
                <div className="space-y-2">
                  {getAvailableDocuments().map(doc => (
                    <div 
                      key={doc._id} 
                      className={`p-3 rounded-lg border cursor-pointer ${
                        selectedDocumentIds.includes(doc._id) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleDocumentSelection(doc._id)}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedDocumentIds.includes(doc._id)}
                          onChange={() => toggleDocumentSelection(doc._id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{doc.url}</p>
                          <p className="text-sm text-gray-500">
                            Type: {doc.type.toUpperCase()} • 
                            Created: {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowAddDocumentModal(false);
                  setSelectedDocumentIds([]);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                onClick={addDocumentsToGroup}
                disabled={selectedDocumentIds.length === 0 || isAddingDocuments}
              >
                {isAddingDocuments ? 'Adding...' : `Add ${selectedDocumentIds.length} Document${selectedDocumentIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGroupsPage; 