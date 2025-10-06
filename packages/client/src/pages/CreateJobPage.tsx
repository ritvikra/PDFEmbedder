import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api';

interface UrlInput {
  url: string;
  type: 'html' | 'pdf';
}

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [urlInputs, setUrlInputs] = useState<UrlInput[]>([{ url: '', type: 'html' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Filter out empty URLs
    const validInputs = urlInputs.filter(input => input.url.trim() !== '');
    
    try {
      // Create jobs for each URL
      await Promise.all(
        validInputs.map(input => 
          createJob(input.url, input.type)
        )
      );
      navigate('/');
    } catch (error) {
      console.error('Failed to create jobs:', error);
      setError('Failed to create jobs. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addUrlField = () => {
    setUrlInputs([...urlInputs, { url: '', type: 'html' }]);
  };

  const updateUrl = (index: number, value: string) => {
    const newInputs = [...urlInputs];
    newInputs[index] = { ...newInputs[index], url: value };
    setUrlInputs(newInputs);
  };

  const updateType = (index: number, type: 'html' | 'pdf') => {
    const newInputs = [...urlInputs];
    newInputs[index] = { ...newInputs[index], type };
    setUrlInputs(newInputs);
  };

  const removeUrl = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create New Job</h1>
        <p className="text-gray-600">Process one or more URLs simultaneously</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {urlInputs.map((input, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={input.url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="Enter URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <select
                value={input.type}
                onChange={(e) => updateType(index, e.target.value as 'html' | 'pdf')}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
              {urlInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addUrlField}
          className="text-green-600 hover:text-green-700"
        >
          + Add another URL
        </button>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Jobs'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage; 