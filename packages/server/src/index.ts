// ensures that the env variables are loaded before anything else -- do not switch the order of these imports
import './env'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectToDatabase } from './db'
import { jobsRouter } from './routers/jobs'
import { authRouter } from './routers/auth'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import mongoose from 'mongoose'
import { documentsRouter } from './routers/documents.js'
import { documentGroupsRouter } from './routers/documentGroups.js'
import { env } from './env'

const app = express()
const server = http.createServer(app)

// Create WebSocket server
const wss = new WebSocketServer({ server })

// Store client subscriptions
const subscriptions = new Map<string, Set<WebSocket>>()

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected')
    
    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message)
            
            if (data.type === 'subscribe' && data.jobId) {
                if (!subscriptions.has(data.jobId)) {
                    subscriptions.set(data.jobId, new Set())
                }
                subscriptions.get(data.jobId)?.add(ws)
            } else if (data.type === 'unsubscribe' && data.jobId) {
                subscriptions.get(data.jobId)?.delete(ws)
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error)
        }
    })
    
    ws.on('close', () => {
        // Remove client from all subscriptions
        subscriptions.forEach((clients, jobId) => {
            clients.delete(ws)
            if (clients.size === 0) {
                subscriptions.delete(jobId)
            }
        })
    })
})

// Function to send job updates to subscribed clients
export const sendJobUpdate = (jobId: string, update: any) => {
    const clients = subscriptions.get(jobId)
    if (clients) {
        const message = JSON.stringify({ type: 'jobUpdate', jobId, update })
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    }
}

// Function to broadcast job updates to all subscribed clients
export const broadcastJobUpdate = async (jobId: string) => {
    try {
        // Import here to avoid circular dependencies
        const { getJobById } = await import('./service/jobService')
        
        const job = await getJobById(jobId)
        if (!job) return
        
        // Send to all clients subscribed to this job
        const clients = subscriptions.get(jobId)
        if (clients) {
            const message = JSON.stringify(job)
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })
        }
    } catch (error) {
        console.error(`Error broadcasting job update for ${jobId}:`, error)
    }
}

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: env.ENV === 'remote' ? true : ['http://localhost:3001', `http://${env.VM_IP_ADDRESS}:3001`],
    credentials: true
}))

// Routes
app.use('/jobs', jobsRouter)
app.use('/auth', authRouter)
app.use('/documents', documentsRouter)
app.use('/document-groups', documentGroupsRouter)

app.get('/', (req, res) => {
    res.send('Hello World')
})

// Connect to MongoDB
connectToDatabase()
    .then(() => {
        console.log('Connected to MongoDB')
        
        // Start server
        const port = process.env.PORT || 3000
        server.listen(Number(port), '0.0.0.0', () => {
            console.log(`Server running on port ${port}`)
        })
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error)
    })
