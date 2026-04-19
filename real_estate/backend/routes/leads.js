import express from 'express'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { sendEmailReminder } from '../utils/email.js'

const router = express.Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const query = {}
    if (req.query.status) query.status = req.query.status
    if (req.query.agent) query.agent = req.query.agent
    const leads = await Lead.find(query).populate('agent', 'name email role')
    res.json(leads)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/reminders/upcoming', async (req, res) => {
  try {
    const now = new Date()
    const leads = await Lead.find({ 'reminders.date': { $gte: now }, 'reminders.completed': false })
      .populate('agent', 'name email role')
    const upcoming = leads.flatMap((lead) =>
      lead.reminders
        .filter((reminder) => reminder.date >= now && !reminder.completed)
        .map((reminder) => ({
          leadId: lead._id,
          leadName: lead.name,
          agent: lead.agent,
          ...reminder.toObject(),
        }))
    )
    res.json(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/reminders/notifications', async (req, res) => {
  try {
    const now = new Date()
    const threshold = new Date(now)
    threshold.setDate(threshold.getDate() + 1)
    const leads = await Lead.find({ 'reminders.completed': false }).populate('agent', 'name email role')
    const notifications = leads.flatMap((lead) =>
      lead.reminders
        .filter((reminder) => !reminder.completed)
        .map((reminder) => ({
          leadId: lead._id,
          leadName: lead.name,
          agent: lead.agent,
          status: new Date(reminder.date) <= now ? 'overdue' : new Date(reminder.date) <= threshold ? 'due' : 'upcoming',
          ...reminder.toObject(),
        }))
    )
    res.json(notifications.sort((a, b) => new Date(a.date) - new Date(b.date)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('agent', 'name email role')
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const leadData = { ...req.body }
    if (!leadData.agent) delete leadData.agent
    const lead = await Lead.create(leadData)
    const populated = await lead.populate('agent', 'name email role')
    res.status(201).json(populated)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json({ message: 'Lead deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/:id/status', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.status = req.body.status || lead.status
    await lead.save()
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/:id/assign', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.agent = req.body.agent
    await lead.save()
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/:id/follow-up', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.followUps.push({ date: req.body.date || new Date(), note: req.body.note || '' })
    await lead.save()
    await lead.populate('agent', 'name email role')
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/:id/reminder', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('agent')
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.reminders.push({
      date: new Date(req.body.date),
      note: req.body.note || '',
      completed: false,
    })
    await lead.save()
    await lead.populate('agent', 'name email role')
    
    if (lead.agent && lead.agent.emailNotifications) {
      sendEmailReminder({
        to: lead.agent.email,
        leadName: lead.name,
        reminderDate: req.body.date,
        reminderNote: req.body.note,
      })
    }
    
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/:id/reminder/:reminderId/complete', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const reminder = lead.reminders.id(req.params.reminderId)
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })
    reminder.completed = true
    await lead.save()
    await lead.populate('agent', 'name email role')
    res.json(lead)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
