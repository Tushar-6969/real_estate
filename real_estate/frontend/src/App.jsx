import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const leadStatuses = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']
const propertyStatuses = ['Available', 'Under Offer', 'Sold']
const dealStages = ['Inquiry', 'Negotiation', 'Agreement', 'Closed']
const clientTypes = ['Buyer', 'Seller']

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('realestate_token') || '')
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('realestate_user')
    if (!stored || stored === 'undefined' || stored === 'null') return null
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem('realestate_user')
      return null
    }
  })
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'agent' })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leads, setLeads] = useState([])
  const [properties, setProperties] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', budget: '', preferences: '', source: 'website', agent: '' })
  const [agents, setAgents] = useState([])
  const [followUpNotes, setFollowUpNotes] = useState({})
  const [leadReminderNotes, setLeadReminderNotes] = useState({})
  const [leadReminderDates, setLeadReminderDates] = useState({})
  const [notifications, setNotifications] = useState([])
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [seenNotifications, setSeenNotifications] = useState([])
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false)
  const [newProperty, setNewProperty] = useState({ title: '', type: 'Residential', location: '', price: '', size: '', amenities: '', description: '', status: 'Available' })
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', type: 'Buyer', preferences: '' })
  const [newDeal, setNewDeal] = useState({ client: '', property: '', stage: 'Inquiry', amount: '', commissionRate: 2.5, notes: '' })
  const [clients, setClients] = useState([])
  const [deals, setDeals] = useState([])
  const [propertyImages, setPropertyImages] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const authHeaders = useMemo(() => ({
    Authorization: authToken ? `Bearer ${authToken}` : '',
  }), [authToken])

  useEffect(() => {
    if (authToken) {
      fetchAgents()
      fetchLeads()
      fetchProperties()
      fetchClients()
      fetchDeals()
      fetchSummary()
      fetchNotifications()
    }
  }, [authToken])

  useEffect(() => {
    if (authToken) {
      fetchNotifications()
    }
  }, [authToken, leads])

  const notificationKey = (item) => `${item.leadId}-${item._id || item.date}`

  const requestBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  const showBrowserNotification = (item) => {
    if (notificationPermission !== 'granted' || !('Notification' in window)) return
    const title = `Reminder: ${item.leadName}`
    const body = `${new Date(item.date).toLocaleDateString()} · ${item.note}`
    new Notification(title, { body })
  }

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/leads/reminders/notifications')
      setNotifications(data)
      const newItems = data.filter((item) => !seenNotifications.includes(notificationKey(item)))
      if (notificationPermission === 'granted') {
        newItems.forEach(showBrowserNotification)
      }
      setSeenNotifications((prev) => [...prev, ...newItems.map(notificationKey)])
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
    }
  }

  const fetchAgents = async () => {
    try {
      const data = await apiFetch('/auth/users')
      setAgents(data)
    } catch (error) {
      console.error('Failed to load agents:', error)
      setAgents([])
    }
  }

  const apiFetch = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Request failed')
    }
    return response.json()
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body = { email: authForm.email, password: authForm.password }
      if (authMode === 'register') {
        body.name = authForm.name
        body.role = authForm.role
      }
      const response = await fetch(`${API_URL}/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || response.statusText || 'Authentication failed')
      }
      setAuthToken(data.token)
      setUser(data.user)
      localStorage.setItem('realestate_token', data.token)
      localStorage.setItem('realestate_user', JSON.stringify(data.user))
      setAuthForm({ name: '', email: '', password: '', role: 'agent' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setAuthToken('')
    setUser(null)
    localStorage.removeItem('realestate_token')
    localStorage.removeItem('realestate_user')
  }

  const loginAsDemo = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@realestate.com', password: 'demo123' }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message || response.statusText || 'Demo login failed')
      }
      setAuthToken(data.token)
      setUser(data.user)
      localStorage.setItem('realestate_token', data.token)
      localStorage.setItem('realestate_user', JSON.stringify(data.user))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async () => {
    try {
      const data = await apiFetch('/leads')
      setLeads(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProperties = async () => {
    try {
      const query = propertySearch ? `?location=${encodeURIComponent(propertySearch)}` : ''
      const data = await apiFetch(`/properties${query}`)
      setProperties(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchClients = async () => {
    try {
      const data = await apiFetch('/clients')
      setClients(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDeals = async () => {
    try {
      const data = await apiFetch('/deals')
      setDeals(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSummary = async () => {
    try {
      const data = await apiFetch('/reports/summary')
      setSummary(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleClientSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      setNewClient({ name: '', email: '', phone: '', type: 'Buyer', preferences: '' })
      fetchClients()
      fetchSummary()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDealSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      })
      setNewDeal({ client: '', property: '', stage: 'Inquiry', amount: '', commissionRate: 2.5, notes: '' })
      fetchDeals()
      fetchSummary()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      })
      setNewLead({ name: '', phone: '', email: '', budget: '', preferences: '', source: 'website', agent: '' })
      fetchLeads()
      fetchSummary()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadFollowUp = async (leadId) => {
    const note = followUpNotes[leadId]
    if (!note) return
    setLoading(true)
    try {
      const updatedLead = await apiFetch(`/leads/${leadId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      setLeads((prev) => prev.map((lead) => (lead._id === leadId ? updatedLead : lead)))
      setFollowUpNotes((prev) => ({ ...prev, [leadId]: '' }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadReminder = async (leadId) => {
    const note = leadReminderNotes[leadId]
    const date = leadReminderDates[leadId]
    if (!note || !note.trim()) {
      setError('Please enter a reminder note')
      return
    }
    if (!date) {
      setError('Please select a reminder date')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const updatedLead = await apiFetch(`/leads/${leadId}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, date }),
      })
      setLeads((prev) => prev.map((lead) => (lead._id === leadId ? updatedLead : lead)))
      setLeadReminderNotes((prev) => ({ ...prev, [leadId]: '' }))
      setLeadReminderDates((prev) => ({ ...prev, [leadId]: '' }))
      setSuccess(`Reminder scheduled for ${new Date(date).toLocaleDateString()}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(`Failed to schedule reminder: ${error.message}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const completeReminder = async (leadId, reminderId) => {
    setLoading(true)
    try {
      const updatedLead = await apiFetch(`/leads/${leadId}/reminder/${reminderId}/complete`, {
        method: 'POST',
      })
      setLeads((prev) => prev.map((lead) => (lead._id === leadId ? updatedLead : lead)))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmailNotifications = async () => {
    try {
      await apiFetch('/auth/preferences/email-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !emailNotificationsEnabled, userId: user.id }),
      })
      setEmailNotificationsEnabled(!emailNotificationsEnabled)
    } catch (error) {
      console.error('Failed to update email notification preference:', error)
    }
  }

  const handlePropertySubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(newProperty).forEach(([key, value]) => formData.append(key, value))
      propertyImages.forEach((file) => formData.append('images', file))
      await apiFetch('/properties', {
        method: 'POST',
        body: formData,
      })
      setNewProperty({ title: '', type: 'Residential', location: '', price: '', size: '', amenities: '', description: '', status: 'Available' })
      setPropertyImages([])
      fetchProperties()
      fetchSummary()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (id, status) => {
    try {
      await apiFetch(`/leads/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchLeads()
      fetchSummary()
    } catch (error) {
      console.error(error)
    }
  }

  const filteredLeads = statusFilter ? leads.filter((lead) => lead.status === statusFilter) : leads
  const filteredProperties = properties.filter((property) => (statusFilter ? property.status === statusFilter : true))
  const upcomingReminders = leads
    .flatMap((lead) =>
      (lead.reminders || [])
        .filter((reminder) => reminder.date && !reminder.completed && new Date(reminder.date) >= new Date())
        .map((reminder) => ({
          ...reminder,
          leadId: lead._id,
          leadName: lead.name,
          agent: lead.agent,
        }))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (!authToken) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <h1>Real Estate CRM</h1>
        </aside>
        <main className="content auth-screen">
          <div className="auth-panel">
            <h2>{authMode === 'login' ? 'Sign in' : 'Register'}</h2>
            <form onSubmit={handleAuthSubmit} className="form-grid auth-form">
              {authMode === 'register' && (
                <label>
                  Name
                  <input placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                </label>
              )}
              <label>
                Email
                <input type="email" placeholder="Email address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
              </label>
              <label>
                Password
                <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              </label>
              {authMode === 'register' && (
                <label>
                  Role
                  <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              )}
              {error && <p className="error-text">{error}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Register'}</button>
            </form>
            <button className="secondary-button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Create an account' : 'Back to login'}
            </button>
            <button className="secondary-button" type="button" onClick={loginAsDemo}>
              Use demo account
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h1>Real Estate CRM</h1>
          <p className="sidebar-user">{user?.name} · {user?.role}</p>
        </div>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Leads</button>
          <button className={activeTab === 'properties' ? 'active' : ''} onClick={() => setActiveTab('properties')}>Properties</button>
          <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>Clients</button>
          <button className={activeTab === 'deals' ? 'active' : ''} onClick={() => setActiveTab('deals')}>Deals</button>
          <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
            Notifications {notifications.length > 0 && <span className="badge-notification">{notifications.length}</span>}
          </button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="content">
        {activeTab === 'dashboard' && (
          <section>
            <header className="section-header">
              <h2>Dashboard</h2>
              <button className="secondary-button small" type="button" onClick={requestBrowserNotificationPermission}>
                Enable browser reminders
              </button>
            </header>
            <div className="metrics-grid">
              <div className="metric-card">
                <span>Leads</span>
                <strong>{summary?.leadCount ?? '-'}</strong>
              </div>
              <div className="metric-card">
                <span>Properties</span>
                <strong>{summary?.propertyCount ?? '-'}</strong>
              </div>
              <div className="metric-card">
                <span>Clients</span>
                <strong>{summary?.clientCount ?? '-'}</strong>
              </div>
              <div className="metric-card">
                <span>Deals</span>
                <strong>{summary?.dealCount ?? '-'}</strong>
              </div>
            </div>

            <div className="panel">
              <h3>Upcoming reminders</h3>
              {upcomingReminders.length > 0 ? (
                <ul className="reminder-list">
                  {upcomingReminders.slice(0, 5).map((reminder) => (
                    <li key={`${reminder.leadId}-${reminder._id || reminder.date}`}>
                      <strong>{reminder.leadName}</strong> · {new Date(reminder.date).toLocaleDateString()} · {reminder.note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reminders scheduled.</p>
              )}
            </div>
            <div className="overview-grid">
              <div className="panel">
                <h3>Lead pipeline</h3>
                <ul>
                  {summary?.leadStages?.map((stage) => (
                    <li key={stage._id}>{stage._id}: {stage.count}</li>
                  ))}
                </ul>
              </div>
              <div className="panel">
                <h3>Deal stages</h3>
                <ul>
                  {summary?.dealStages?.map((stage) => (
                    <li key={stage.stage}>{stage.stage}: {stage.count}</li>
                  ))}
                </ul>
                <p className="commission">Total commission: ${summary?.totalCommission.toFixed(2) ?? '0.00'}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'leads' && (
          <section>
            <header className="section-header">
              <h2>Lead Management</h2>
              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}
              <div className="filters-row">
                <label>
                  Status filter
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All</option>
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </header>

            <div className="grid-two-columns">
              <article className="panel">
                <h3>Add New Lead</h3>
                <form onSubmit={handleLeadSubmit} className="form-grid">
                  <label>
                    Name
                    <input placeholder="Lead full name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} required />
                  </label>
                  <label>
                    Phone
                    <input placeholder="Phone number" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} required />
                  </label>
                  <label>
                    Email
                    <input type="email" placeholder="Email address" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                  </label>
                  <label>
                    Budget
                    <input type="number" placeholder="Budget in USD" value={newLead.budget} onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })} />
                  </label>
                  <label>
                    Source
                    <select value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}>
                      <option value="website">Website</option>
                      <option value="ads">Ads</option>
                      <option value="referral">Referral</option>
                      <option value="call">Call</option>
                    </select>
                  </label>
                  <label>
                    Assign agent
                    <select value={newLead.agent} onChange={(e) => setNewLead({ ...newLead, agent: e.target.value })}>
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="full-width">
                    Preferences
                    <textarea placeholder="Lead preferences and requirements..." value={newLead.preferences} onChange={(e) => setNewLead({ ...newLead, preferences: e.target.value })} rows="3" />
                  </label>
                  <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Lead'}</button>
                </form>
              </article>

              <article className="panel">
                <h3>Lead list</h3>
                <div className="list-scroll">
                  {filteredLeads.map((lead) => (
                    <div key={lead._id} className="list-block">
                      <div className="list-item">
                        <div>
                          <strong>{lead.name}</strong>
                          <p>{lead.phone} · {lead.email || 'No email'}</p>
                          <p>{lead.source} · {lead.budget ? `$${lead.budget}` : 'Budget not set'}</p>
                          <p className="tiny-text">Agent: {lead.agent ? lead.agent.name || lead.agent : 'Unassigned'}</p>
                        </div>
                        <select value={lead.status} onChange={(e) => updateLeadStatus(lead._id, e.target.value)}>
                          {leadStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div className="list-item extra-row">
                        <div className="follow-up-row">
                          <input
                            placeholder="Add follow-up note"
                            value={followUpNotes[lead._id] || ''}
                            onChange={(e) => setFollowUpNotes((prev) => ({ ...prev, [lead._id]: e.target.value }))}
                          />
                          <button type="button" onClick={() => handleLeadFollowUp(lead._id)}>Save follow-up</button>
                        </div>
                        <div className="follow-up-row">
                          <input
                            type="date"
                            value={leadReminderDates[lead._id] || ''}
                            onChange={(e) => setLeadReminderDates((prev) => ({ ...prev, [lead._id]: e.target.value }))}
                          />
                          <input
                            placeholder="Reminder note"
                            value={leadReminderNotes[lead._id] || ''}
                            onChange={(e) => setLeadReminderNotes((prev) => ({ ...prev, [lead._id]: e.target.value }))}
                          />
                          <button type="button" onClick={() => handleLeadReminder(lead._id)}>Schedule reminder</button>
                        </div>
                      </div>
                      {lead.followUps?.length > 0 && (
                        <div className="list-item follow-up-list">
                          {lead.followUps.map((follow, index) => (
                            <div key={index}>
                              <small>{new Date(follow.date).toLocaleDateString()} · {follow.note}</small>
                            </div>
                          ))}
                        </div>
                      )}
                      {lead.reminders?.length > 0 && (
                        <div className="list-item follow-up-list">
                          <strong>Reminders</strong>
                          {lead.reminders.map((reminder) => (
                            <div key={reminder._id || reminder.date} className="reminder-entry">
                              <small>
                                {new Date(reminder.date).toLocaleDateString()} · {reminder.note} · {reminder.completed ? 'Done' : 'Pending'}
                              </small>
                              {!reminder.completed && (
                                <button type="button" onClick={() => completeReminder(lead._id, reminder._id)}>Complete</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'notifications' && (
          <section>
            <header className="section-header">
              <h2>Notification Center</h2>
              <button className="secondary-button small" type="button" onClick={requestBrowserNotificationPermission}>
                Enable browser reminders
              </button>
            </header>
            <div className="panel">
              <h3>Reminder notifications</h3>
              {notifications.length > 0 ? (
                <ul className="reminder-list">
                  {notifications.map((notification) => (
                    <li key={`${notification.leadId}-${notification._id || notification.date}`}>
                      <strong>{notification.leadName}</strong> · {new Date(notification.date).toLocaleDateString()} · {notification.note}
                      <span className="tiny-text">{notification.status.toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No active reminder notifications.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section>
            <header className="section-header">
              <h2>Settings & Preferences</h2>
            </header>
            <div className="panel">
              <h3>Notification Preferences</h3>
              <div className="settings-group">
                <label>
                  <input
                    type="checkbox"
                    checked={emailNotificationsEnabled}
                    onChange={toggleEmailNotifications}
                  />
                  Enable email notifications for reminders
                </label>
                <small>When enabled, email reminders will be logged and sent to {user?.email}</small>
              </div>
            </div>
            <div className="panel">
              <h3>Account Information</h3>
              <div className="settings-group">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'properties' && (
          <section>
            <header className="section-header">
              <h2>Property Management</h2>
              <div className="filters-row">
                <label>
                  Search location
                  <input value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} placeholder="City, neighborhood" />
                </label>
                <button onClick={fetchProperties} type="button">Search</button>
              </div>
            </header>

            <div className="grid-two-columns">
              <article className="panel">
                <h3>Add Property</h3>
                <form onSubmit={handlePropertySubmit} className="form-grid">
                  <label>
                    Title
                    <input placeholder="Property title" value={newProperty.title} onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })} required />
                  </label>
                  <label>
                    Type
                    <select value={newProperty.type} onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </label>
                  <label>
                    Location
                    <input placeholder="Property location" value={newProperty.location} onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })} required />
                  </label>
                  <label>
                    Price
                    <input type="number" placeholder="Price in USD" value={newProperty.price} onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })} required />
                  </label>
                  <label>
                    Size
                    <input placeholder="Size (sq ft)" value={newProperty.size} onChange={(e) => setNewProperty({ ...newProperty, size: e.target.value })} />
                  </label>
                  <label>
                    Status
                    <select value={newProperty.status} onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}>
                      {propertyStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Amenities (comma separated)
                    <input placeholder="Pool, gym, parking..." value={newProperty.amenities} onChange={(e) => setNewProperty({ ...newProperty, amenities: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Description
                    <textarea placeholder="Property description and details..." value={newProperty.description} onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })} rows="3" />
                  </label>
                  <label className="full-width">
                    Upload images
                    <input type="file" multiple accept="image/*" onChange={(e) => setPropertyImages(Array.from(e.target.files))} />
                  </label>
                  <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Create Property'}</button>
                </form>
              </article>

              <article className="panel">
                <h3>Property inventory</h3>
                <div className="list-scroll">
                  {filteredProperties.map((property) => (
                    <div key={property._id} className="list-item property-item">
                      <div>
                        <strong>{property.title}</strong>
                        <p>{property.location} · ${property.price}</p>
                        <p>{property.type} · {property.size || 'Size TBD'}</p>
                      </div>
                      <span className={`badge badge-${property.status.replace(' ', '-').toLowerCase()}`}>{property.status}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'clients' && (
          <section>
            <header className="section-header">
              <h2>Client Management</h2>
            </header>
            <div className="grid-two-columns">
              <article className="panel">
                <h3>Add Client</h3>
                <form onSubmit={handleClientSubmit} className="form-grid">
                  <label>
                    Name
                    <input placeholder="Client full name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required />
                  </label>
                  <label>
                    Email
                    <input type="email" placeholder="Email address" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                  </label>
                  <label>
                    Phone
                    <input placeholder="Phone number" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} required />
                  </label>
                  <label>
                    Type
                    <select value={newClient.type} onChange={(e) => setNewClient({ ...newClient, type: e.target.value })}>
                      {clientTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label className="full-width">
                    Preferences
                    <textarea placeholder="Client preferences and needs..." value={newClient.preferences} onChange={(e) => setNewClient({ ...newClient, preferences: e.target.value })} rows="3" />
                  </label>
                  <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Client'}</button>
                </form>
              </article>
              <article className="panel">
                <h3>Client list</h3>
                <div className="list-scroll">
                  {clients.map((client) => (
                    <div key={client._id} className="list-item property-item">
                      <div>
                        <strong>{client.name}</strong>
                        <p>{client.phone} · {client.email || 'No email'}</p>
                        <p>{client.type} · {client.preferences || 'No preferences set'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'deals' && (
          <section>
            <header className="section-header">
              <h2>Deal Management</h2>
            </header>
            <div className="grid-two-columns">
              <article className="panel">
                <h3>Create Deal</h3>
                <form onSubmit={handleDealSubmit} className="form-grid">
                  <label>
                    Client
                    <select value={newDeal.client} onChange={(e) => setNewDeal({ ...newDeal, client: e.target.value })} required>
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Property
                    <select value={newDeal.property} onChange={(e) => setNewDeal({ ...newDeal, property: e.target.value })} required>
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property._id} value={property._id}>{property.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Stage
                    <select value={newDeal.stage} onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}>
                      {dealStages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Amount
                    <input type="number" placeholder="Deal amount" value={newDeal.amount} onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })} required />
                  </label>
                  <label>
                    Commission rate (%)
                    <input type="number" placeholder="2.5" value={newDeal.commissionRate} onChange={(e) => setNewDeal({ ...newDeal, commissionRate: e.target.value })} />
                  </label>
                  <label className="full-width">
                    Notes
                    <textarea placeholder="Deal notes and details..." value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} rows="3" />
                  </label>
                  <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Deal'}</button>
                </form>
              </article>
              <article className="panel">
                <h3>Deal pipeline</h3>
                <div className="list-scroll">
                  {deals.map((deal) => (
                    <div key={deal._id} className="list-item property-item">
                      <div>
                        <strong>{deal.client?.name || 'Client'} – {deal.property?.title || 'Property'}</strong>
                        <p>{deal.stage} · ${deal.amount}</p>
                        <p>Commission: ${deal.commission?.toFixed(2) ?? '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
