import axios from 'axios';
import { API_URL } from '../env';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Job API
export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJobById = async (jobId: string) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const createJob = async (url: string, type: string) => {
  const response = await api.post('/jobs', { url, type });
  return response.data;
};

export const deleteJob = async (jobId: string) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const retryJob = async (jobId: string) => {
  const response = await api.post(`/jobs/${jobId}/retry`);
  return response.data;
};

// Documents API
export const getAllDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

// Document Groups API
export const getRootGroups = async () => {
  const response = await api.get('/document-groups');
  return response.data;
};

export const getGroupById = async (groupId: string) => {
  const response = await api.get(`/document-groups/${groupId}`);
  return response.data;
};

export const createGroup = async (groupData: any) => {
  const response = await api.post('/document-groups', groupData);
  return response.data;
};

export const updateGroup = async (groupId: string, groupData: any) => {
  const response = await api.put(`/document-groups/${groupId}`, groupData);
  return response.data;
};

export const deleteGroup = async (groupId: string, reassignToGroupId: string | null = null) => {
  const params = reassignToGroupId ? { reassignToGroupId } : {};
  try {
    const response = await api.delete(`/document-groups/${groupId}`, { params });
    return response.data || true;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const addDocumentToGroup = async (documentId: string, groupId: string) => {
  const response = await api.post(`/document-groups/${groupId}/documents/${documentId}`);
  return response.data;
};

export const removeDocumentFromGroup = async (documentId: string, groupId: string) => {
  await api.delete(`/document-groups/${groupId}/documents/${documentId}`);
  return true;
};

export const getDocumentGroups = async (documentId: string) => {
  const response = await api.get(`/document-groups/document/${documentId}`);
  return response.data;
};

export const searchGroups = async (query: string) => {
  const response = await api.get('/document-groups/search/groups', { params: { query } });
  return response.data;
};

export const searchDocuments = async (params: any) => {
  const response = await api.get('/document-groups/search/documents', { params });
  return response.data;
};

export default api;
