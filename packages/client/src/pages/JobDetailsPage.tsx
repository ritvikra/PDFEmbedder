import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useJobUpdates } from '../hooks/useJobUpdates';
import { API_URL } from '../env';

interface Page {
  text: string;
  pageNumber: number;
  imageUrl?: string;
}

interface ChunkObject {
  text: string;
  embedding: number[];
  pageNumber: number;
}

interface Document {
  _id: string;
  jobId: string;
  url: string;
  type: 'html' | 'pdf';
  extractedText: string;
  chunks: string[];
  chunkObjects?: ChunkObject[];
  pages?: Page[];
  content: string;
}

interface Job {
  _id: string;
  url: string;
  type: 'html' | 'pdf';
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: string[];
  createdAt: string;
  documents?: Document[];
}

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmbeddings, setShowEmbeddings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        console.error('Failed to fetch job:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Subscribe to WebSocket updates
  useJobUpdates(jobId, (updatedJob) => {
    setJob(updatedJob);
  });

  const toggleEmbedding = (chunkId: string) => {
    setShowEmbeddings(prev => ({
      ...prev,
      [chunkId]: !prev[chunkId]
    }));
  };

  // Format embedding for display
  const formatEmbedding = (embedding: number[]) => {
    if (!embedding || embedding.length === 0) return 'No embedding available';
    
    // Show a preview of the embedding vector
    const previewLength = 10;
    const preview = embedding.slice(0, previewLength).map(val => val.toFixed(4));
    
    return `[${preview.join(', ')}${embedding.length > previewLength ? ', ...' : ''}] (${embedding.length} dimensions)`;
  };

  if (loading) return <div>Loading job details...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Job Details</h1>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h2 className="font-medium">URL</h2>
          <p className="text-gray-600">{job.url}</p>
        </div>
        
        <div>
          <h2 className="font-medium">Status</h2>
          <span className={`
            inline-block px-2 py-1 text-sm rounded-full
            ${job.status === 'done' ? 'bg-green-100 text-green-800' : ''}
            ${job.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
            ${job.status === 'error' ? 'bg-red-100 text-red-800' : ''}
            ${job.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        <div>
          <h2 className="font-medium mb-3">Progress</h2>
          <div className="flex flex-wrap gap-2">
            {job.progress.map((step, index) => {
              const isLast = index === job.progress.length - 1;
              return (
                <button
                  key={index}
                  disabled
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isLast ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                  `}
                >
                  {step}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-medium mb-4">Status Information</h2>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Status:</span>
            <span className={`font-medium
              ${job.status === 'done' ? 'text-green-600' : ''}
              ${job.status === 'processing' ? 'text-blue-600' : ''}
              ${job.status === 'error' ? 'text-red-600' : ''}
              ${job.status === 'pending' ? 'text-gray-600' : ''}
            `}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{job.type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      {job.documents && job.documents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Extracted Content</h2>
          <div className="space-y-8">
            {job.documents.map((doc) => (
              <div key={doc._id} className="space-y-4">
                <h3 className="font-medium text-gray-900">Document: {doc.url}</h3>
                
                {/* For PDF documents */}
                {doc.type === 'pdf' && (
                  <div className="space-y-6">
                    {/* Extracted Text */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h4 className="font-medium">Complete Document Text</h4>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-auto max-h-60">
                          {doc.extractedText}
                        </pre>
                      </div>
                    </div>
                    
                    {/* PDF Pages */}
                    {doc.pages && doc.pages.length > 0 && (
                      <div className="space-y-8">
                        <h4 className="font-medium text-lg">Pages</h4>
                        {doc.pages.map((page, pageIndex) => (
                          <div key={pageIndex} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                              <h5 className="font-medium">Page {page.pageNumber}</h5>
                            </div>
                            <div className="p-4 space-y-4">
                              {/* Page Image */}
                              {page.imageUrl ? (
                                <div className="flex justify-center bg-gray-100 p-4 rounded">
                                  <img 
                                    src={page.imageUrl} 
                                    alt={`Page ${page.pageNumber}`}
                                    className="max-h-[500px] object-contain border shadow"
                                    onError={(e) => {
                                      console.error(`Error loading image for page ${page.pageNumber}`);
                                      // Replace with fallback image
                                      e.currentTarget.onerror = null; // Prevent infinite loop
                                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                        <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
                                          <rect width="100%" height="100%" fill="#f0f0f0" />
                                          <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="#666666">
                                            PDF Page ${page.pageNumber}
                                          </text>
                                        </svg>
                                      `)}`;
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="flex justify-center bg-gray-100 p-4 rounded">
                                  <div className="w-[600px] h-[400px] flex items-center justify-center border border-gray-300 bg-gray-50 text-gray-500">
                                    No image available for page {page.pageNumber}
                                  </div>
                                </div>
                              )}
                              
                              {/* Page Text */}
                              <div>
                                <h6 className="font-medium mb-2">Extracted Text</h6>
                                <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                                  {page.text}
                                </div>
                              </div>
                              
                              {/* Page Chunks with Embeddings */}
                              {doc.chunkObjects && doc.chunkObjects.length > 0 && (
                                <div>
                                  <h6 className="font-medium mb-2">Chunks with Embeddings</h6>
                                  <div className="space-y-2">
                                    {doc.chunkObjects
                                      .filter(chunk => chunk.pageNumber === page.pageNumber)
                                      .map((chunk, i) => (
                                        <div key={i} className="text-sm border border-gray-200 rounded overflow-hidden">
                                          <div className="bg-gray-50 p-3 text-gray-800">
                                            {chunk.text}
                                          </div>
                                          <div className="border-t border-gray-200 flex items-center px-3 py-2 bg-gray-50">
                                            <button 
                                              onClick={() => toggleEmbedding(`${doc._id}-${pageIndex}-${i}`)}
                                              className="text-xs px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
                                            >
                                              {showEmbeddings[`${doc._id}-${pageIndex}-${i}`] ? 'Hide Embedding' : 'Show Embedding'}
                                            </button>
                                          </div>
                                          {showEmbeddings[`${doc._id}-${pageIndex}-${i}`] && (
                                            <div className="p-3 text-xs font-mono bg-gray-100 border-t border-gray-200 overflow-x-auto">
                                              {formatEmbedding(chunk.embedding)}
                                            </div>
                                          )}
                                        </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Legacy Chunks Display (if no chunkObjects available) */}
                              {(!doc.chunkObjects || doc.chunkObjects.length === 0) && doc.chunks && doc.chunks.length > 0 && (
                                <div>
                                  <h6 className="font-medium mb-2">Chunks</h6>
                                  <div className="space-y-2">
                                    {doc.chunks.filter(chunk => 
                                      chunk.startsWith(`Page ${page.pageNumber}:`)
                                    ).map((chunk, i) => (
                                      <div key={i} className="text-sm text-gray-800 bg-gray-50 p-4 rounded">
                                        {chunk.substring(chunk.indexOf(':') + 1)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* For HTML documents */}
                {doc.type === 'html' && (
                  <div className="space-y-4">
                    {/* Full HTML document */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h4 className="font-medium">Full HTML Document</h4>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-auto max-h-96">
                          {doc.content}
                        </pre>
                      </div>
                    </div>
                    
                    {/* Extracted Text */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h4 className="font-medium">Extracted Text</h4>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded">
                          {doc.extractedText}
                        </pre>
                      </div>
                    </div>
                    
                    {/* Chunks with Embeddings */}
                    {doc.chunkObjects && doc.chunkObjects.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">Text Chunks with Embeddings</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {doc.chunkObjects.map((chunk, index) => (
                            <div key={index} className="text-sm border border-gray-200 rounded overflow-hidden">
                              <div className="bg-gray-50 p-3 text-gray-800">
                                {chunk.text}
                              </div>
                              <div className="border-t border-gray-200 flex items-center px-3 py-2 bg-gray-50">
                                <button 
                                  onClick={() => toggleEmbedding(`${doc._id}-html-${index}`)}
                                  className="text-xs px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
                                >
                                  {showEmbeddings[`${doc._id}-html-${index}`] ? 'Hide Embedding' : 'Show Embedding'}
                                </button>
                              </div>
                              {showEmbeddings[`${doc._id}-html-${index}`] && (
                                <div className="p-3 text-xs font-mono bg-gray-100 border-t border-gray-200 overflow-x-auto">
                                  {formatEmbedding(chunk.embedding)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Legacy Chunks Display (if no chunkObjects available) */}
                    {(!doc.chunkObjects || doc.chunkObjects.length === 0) && doc.chunks && doc.chunks.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h4 className="font-medium">Text Chunks</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {doc.chunks.map((chunk, index) => (
                            <div key={index} className="text-sm text-gray-800 bg-gray-50 p-4 rounded">
                              {chunk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage; 