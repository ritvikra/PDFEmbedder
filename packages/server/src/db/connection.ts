import mongoose from 'mongoose';
import { env } from '../env'

export const connection = async () => {
    const uri = env.MONGO_URI
    try {
        await mongoose.connect(uri)
        console.log('connected')
    } catch (err) {
        console.error('Connection Error: ', err)
        process.exit(1)
    }
}