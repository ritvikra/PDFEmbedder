import { Job } from '../db/jobs'
import { Document } from '../db/document'
import { processHtml } from '../processor/html'
import { processPdf } from '../processor/pdf'

/**
 * Process a job by its ID
 */
export const processJob = async (jobId: string) => {
  const job = await Job.findById(jobId)
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`)
  }
  
  // Don't reprocess jobs that are already done or in progress
  if (job.status === 'done') {
    return job
  }
  
  if (job.status === 'processing') {
    return job
  }
  
  job.status = 'processing'
  await job.save()
  
  try {
    if (job.type === 'html') {
      await processHtml(job)
    } else if (job.type === 'pdf') {
      await processPdf(job)
    } else {
      throw new Error(`Unsupported job type: ${job.type}`)
    }
    
    // The processors will set the status to 'done' and save the job
    return job
  } catch (err) {
    console.error(`Error processing job ${jobId}:`, err)
    job.status = 'error'
    job.progress.push(`error: ${err instanceof Error ? err.message : String(err)}`)
    await job.save()
    throw err
  }
}

/**
 * Create a new job
 */
export const createJob = async (url: string, type: 'html' | 'pdf') => {
  const job = await Job.create({
    url,
    type,
    status: 'pending',
    progress: ['job created']
  })
  
  return job
}

/**
 * Get a job by its ID
 */
export const getJobById = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) return null;
  
  // Get associated documents
  const documents = await Document.find({ jobId });
  return {
    ...job.toObject(),
    documents
  };
}

/**
 * Get all jobs
 */
export const getAllJobs = async () => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  
  // Get documents for all jobs
  const jobIds = jobs.map(job => job._id);
  const documents = await Document.find({ jobId: { $in: jobIds } });
  
  // Map documents to their jobs
  return jobs.map(job => ({
    ...job.toObject(),
    documents: documents.filter(doc => doc.jobId.toString() === job._id.toString())
  }));
}

/**
 * Get jobs by status
 */
export const getJobsByStatus = async (status: 'pending' | 'processing' | 'done' | 'error') => {
  const jobs = await Job.find({ status }).sort({ createdAt: -1 });
  
  // Get documents for all jobs
  const jobIds = jobs.map(job => job._id);
  const documents = await Document.find({ jobId: { $in: jobIds } });
  
  // Map documents to their jobs
  return jobs.map(job => ({
    ...job.toObject(),
    documents: documents.filter(doc => doc.jobId.toString() === job._id.toString())
  }));
}

/**
 * Get jobs by type
 */
export const getJobsByType = async (type: 'html' | 'pdf') => {
  const jobs = await Job.find({ type }).sort({ createdAt: -1 });
  
  // Get documents for all jobs
  const jobIds = jobs.map(job => job._id);
  const documents = await Document.find({ jobId: { $in: jobIds } });
  
  // Map documents to their jobs
  return jobs.map(job => ({
    ...job.toObject(),
    documents: documents.filter(doc => doc.jobId.toString() === job._id.toString())
  }));
}

/**
 * Delete a job and its associated document
 */
export const deleteJob = async (jobId: string) => {
  const job = await Job.findById(jobId)
  if (!job) return false
  
  // Delete the associated document if it exists
  await Document.deleteMany({ jobId })
  
  // Delete the job
  await Job.findByIdAndDelete(jobId)
  
  return true
}

/**
 * Retry a failed job
 */
export const retryJob = async (jobId: string) => {
  const job = await Job.findById(jobId)
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`)
  }
  
  if (job.status !== 'error') {
    throw new Error(`Can only retry jobs with status 'error', current status: ${job.status}`)
  }
  
  // Reset job status and progress
  job.status = 'pending'
  job.progress = ['job retried']
  await job.save()
  
  // Process the job
  return await processJob(jobId)
}