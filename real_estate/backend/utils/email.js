import fs from 'fs'
import path from 'path'

const logEmailReminder = (emailData) => {
  const timestamp = new Date().toISOString()
  const logDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logDir, 'email-reminders.log')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const logEntry = `[${timestamp}] Email Reminder Sent\n  To: ${emailData.to}\n  Lead: ${emailData.leadName}\n  Date: ${emailData.reminderDate}\n  Note: ${emailData.reminderNote}\n\n`

  fs.appendFileSync(logFile, logEntry, 'utf8')
  console.log(`Reminder email logged for ${emailData.to}`)
}

export const sendEmailReminder = (emailData) => {
  logEmailReminder(emailData)
}

export const sendReminderDigest = async (agent, reminders) => {
  if (!agent.emailNotifications || reminders.length === 0) return

  const timestamp = new Date().toISOString()
  const logDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logDir, 'email-reminders.log')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const remindersList = reminders.map((r) => `  - Lead: ${r.leadName}, Date: ${r.date}, Note: ${r.note}`).join('\n')
  const digestEntry = `[${timestamp}] Reminder Digest\n  To: ${agent.email}\n  Agent: ${agent.name}\n  Reminders:\n${remindersList}\n\n`

  fs.appendFileSync(logFile, digestEntry, 'utf8')
  console.log(`Reminder digest logged for ${agent.email}`)
}
