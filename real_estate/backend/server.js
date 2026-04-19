import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import User from './models/User.js'
import authRoutes from './routes/auth.js'
import leadRoutes from './routes/leads.js'
import propertyRoutes from './routes/properties.js'
import clientRoutes from './routes/clients.js'
import dealRoutes from './routes/deals.js'
import reportRoutes from './routes/reports.js'

dotenv.config()
const app = express()

const seedDemoUser = async () => {
  const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@realestate.com'
  const demoPassword = process.env.DEMO_USER_PASSWORD || 'demo123'
  const demoName = process.env.DEMO_USER_NAME || 'Demo Agent'

  const existing = await User.findOne({ email: demoEmail })
  if (existing) return

  const hashedPassword = await bcrypt.hash(demoPassword, 10)
  await User.create({ name: demoName, email: demoEmail, password: hashedPassword, role: 'agent' })
  console.log(`Created demo account: ${demoEmail} / ${demoPassword}`)
}

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/reports', reportRoutes)

app.get('/', (req, res) => {
  res.json({ status: 'Real Estate CRM API running' })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()
  await seedDemoUser()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error(error)
  process.exit(1)
})
