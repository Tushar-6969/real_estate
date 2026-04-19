import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import Property from '../models/Property.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename(req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-')
    cb(null, fileName)
  },
})

const upload = multer({ storage })
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const query = {}
    if (req.query.status) query.status = req.query.status
    if (req.query.location) query.location = new RegExp(req.query.location, 'i')
    const properties = await Property.find(query).populate('agent', 'name email')
    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'name email')
    if (!property) return res.status(404).json({ message: 'Property not found' })
    res.json(property)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', upload.array('images', 6), async (req, res) => {
  try {
    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []
    const property = await Property.create({ ...req.body, images })
    res.status(201).json(property)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', upload.array('images', 6), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ message: 'Property not found' })

    const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : property.images
    Object.assign(property, { ...req.body, images })
    await property.save()
    res.json(property)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id)
    if (!property) return res.status(404).json({ message: 'Property not found' })
    res.json({ message: 'Property removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
