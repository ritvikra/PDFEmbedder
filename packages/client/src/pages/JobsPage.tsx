import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useJobUpdates } from '../hooks/useJobUpdates';
import { API_URL } from '../env';

interface Job {
  _id: string;
  url: string;
  type: 'html' | 'pdf';
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: string[];
  createdAt: string;
}

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch all jobs initially
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Subscribe to updates for all jobs
  useEffect(() => {
    const connectWebSocket = () => {
      // Get the host and port from API_URL
      const apiUrl = new URL(API_URL);
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${apiUrl.host}`;
      
      console.log('Connecting JobsPage WebSocket to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for jobs list');
        // Subscribe to all job updates
        jobs.forEach(job => {
          ws.send(JSON.stringify({ type: 'subscribe', jobId: job._id }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Update the specific job in the list
          setJobs(prevJobs => 
            prevJobs.map(job => 
              job._id === data._id ? data : job
            )
          );
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobs.length]); // Re-run when jobs list changes

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <Link
          to="/jobs/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Job
        </Link>
      </div>

      {loading ? (
        <div>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-gray-600">No jobs found. Create a new job to get started.</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{job.url}</h3>
                  <p className="text-sm text-gray-500">
                    Type: {job.type.toUpperCase()} • Created: {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className={`
                  px-2 py-1 text-sm rounded-full
                  ${job.status === 'done' ? 'bg-green-100 text-green-800' : ''}
                  ${job.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                  ${job.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                  ${job.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </div>
              </div>
              {job.progress.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Latest progress: {job.progress[job.progress.length - 1]}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage; 