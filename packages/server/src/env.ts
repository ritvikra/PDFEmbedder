import path from 'path'
import { fileURLToPath } from 'url'
import { load } from 'ts-dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const schema = {
    ENV: ['local' as const, 'remote' as const],
    VM_IP_ADDRESS: String,
    MONGO_URI: String
}

export const env = load(schema, {
    path: path.join(__dirname, '../../../.env')
})
