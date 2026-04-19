import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'agent' })
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'change_this_secret', {
      expiresIn: '7d',
    })
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'change_this_secret', {
      expiresIn: '7d',
    })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/preferences/email-notifications', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.headers.authorization?.replace('Bearer ', '').split('.')[0],
      { emailNotifications: req.body.enabled },
      { new: true }
    )
    if (!user) {
      const userId = req.body.userId
      const updated = await User.findByIdAndUpdate(
        userId,
        { emailNotifications: req.body.enabled },
        { new: true }
      )
      return res.json({ emailNotifications: updated.emailNotifications })
    }
    res.json({ emailNotifications: user.emailNotifications })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
