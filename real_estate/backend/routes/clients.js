import express from 'express'
import Client from '../models/Client.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().populate('lead', 'name status').populate('history.property', 'title location')
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body)
    res.status(201).json(client)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json(client)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json({ message: 'Client removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
