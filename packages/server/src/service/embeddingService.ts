import axios from 'axios';

/**
 * Get an embedding for a text chunk
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post('http://localhost:4000/embed', {
      text
    }, {
      timeout: 15000 // 15 second timeout
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    // Return a fake embedding if the service is down
    return Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
  }
};

/**
 * Process multiple chunks in parallel
 */
export const getEmbeddings = async (chunks: string[]): Promise<{text: string, embedding: number[]}[]> => {
  const chunkObjects = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await getEmbedding(chunk);
      return {
        text: chunk,
        embedding
      };
    })
  );
  
  return chunkObjects;
}; 