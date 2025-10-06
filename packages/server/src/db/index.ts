import mongoose from 'mongoose'
import { env } from '../env'

let isConnected = false

export async function connectToDatabase() {
    if (isConnected) {
        return
    }

    try {
        await mongoose.connect(env.MONGO_URI)
        isConnected = true
        console.log('MongoDB connected')

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
            isConnected = false
        })
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed through app termination')
  process.exit(0)
})

export { mongoose } 