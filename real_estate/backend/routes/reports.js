import express from 'express'
import Lead from '../models/Lead.js'
import Property from '../models/Property.js'
import Deal from '../models/Deal.js'
import Client from '../models/Client.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

router.get('/summary', async (req, res) => {
  try {
    const [leadCount, propertyCount, clientCount, dealCount] = await Promise.all([
      Lead.countDocuments(),
      Property.countDocuments(),
      Client.countDocuments(),
      Deal.countDocuments(),
    ])

    const leadStages = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const dealStages = await Deal.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $project: { stage: '$_id', count: 1, _id: 0 } },
    ])

    const totalCommission = await Deal.aggregate([
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ])

    res.json({
      leadCount,
      propertyCount,
      clientCount,
      dealCount,
      leadStages,
      dealStages,
      totalCommission: totalCommission[0]?.total || 0,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
