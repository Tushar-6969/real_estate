import express from 'express'
import Deal from '../models/Deal.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().populate('client', 'name email phone').populate('property', 'title location price').populate('agent', 'name email')
    res.json(deals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const deal = await Deal.create(req.body)
    res.status(201).json(deal)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    res.json(deal)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id)
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    res.json({ message: 'Deal removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
