# Real Estate CRM Notes

## What this project does

This project is a MERN-stack Real Estate CRM web application designed to manage leads, properties, clients, deals, and reports for a real estate business. It provides a full local development setup without requiring AWS or cloud-specific services, making it easy to demo locally. The app includes:

- User authentication and role support
- Lead capture and status tracking
- Property listing creation and management
- Client profile management
- Deal tracking and commission calculation
- Basic reporting dashboard
- Demo account access for quick login
- Local image uploads for property photos

## Technologies used

- Frontend: React with Vite
- Backend: Node.js, Express
- Database: MongoDB via Mongoose
- Authentication: JWT
- File uploads: Multer
- Styling: CSS with responsive layout

## Where it can be used

This CRM is ideal for:

- Real estate agencies managing property listings and buyer/seller leads
- Sales teams tracking follow-ups and deal stages
- Property managers organizing available units and statuses
- Recruiters or hiring managers looking for a working CRM demo
- Anyone needing a local, self-hosted real estate lead management app

## Key working features

### Authentication
- Email/password login and registration
- JWT-based protected backend routes
- Demo login with built-in demo credentials
- Email notification preferences per user

### Lead Management
- Create and list leads with name, phone, email, budget, source, and preferences
- Filter leads by status
- Update lead status and track follow-ups
- Assign leads to agents
- Schedule reminders for lead follow-ups
- Track reminder history and completion status

### Notifications & Reminders
- Schedule reminders on leads with date and note
- View upcoming reminders on dashboard
- Dedicated Notification Center showing overdue, due, and upcoming reminders
- Browser notification support with opt-in permission
- Email reminder delivery (logged locally for demo purposes)
- User preferences to enable/disable email reminders

### Property Management
- Add property listings with title, type, location, price, size, amenities, and description
- Upload and store property images locally
- Filter and search listings by location and status
- Manage property availability status

### Client Management
- Add buyer/seller profiles
- Track client preferences and contact information
- View client directory in the frontend
- Client data designed to link to leads and deals

### Deal Management
- Create deals with client, property, stage, amount, and commission rate
- Deal stage tracking (Inquiry, Negotiation, Agreement, Closed)
- Commission calculated automatically on the backend
- Deal pipeline listing in the frontend

### Reports and Analytics
- Dashboard metrics for lead count, property count, client count, and deal count
- Aggregated lead stage and deal stage summaries
- Total commission reporting

### Settings & Preferences
- Email notification preferences per user
- Account information display (name, email, role)
- Centralized settings page for reminder and notification management

## Why this is impressive

- The project is a complete working MERN application with a modern frontend and fully functional backend.
- It demonstrates practical CRM features specifically tailored for real estate workflows.
- It includes authentication, client/properties/deals modules, file upload handling, and reporting.
- It is built locally without cloud dependencies, making it easy to demo and deploy in controlled environments.

## Recruiter-ready summary

- This app covers the core CRM modules expected in a real estate hiring case study: lead management with assignment and follow-up reminders, property management with image uploads, client management, deal tracking with commission calculation, and reporting.
- It includes automated reminder scheduling, browser notifications, and email notification support with user preferences.
- It is intentionally built without AWS so that the core functionality is fully visible and easy to run locally.
- The architecture is extendable to add SMS integration, map features, and automation workflows.

## How to run it

### Backend

1. Open a terminal in `backend`
2. Run `npm install`
3. Create a `.env` file from `.env.example`
4. Run `npm run dev`

### Frontend

1. Open a terminal in `frontend`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173`

## Notes for recruiters

This project showcases the ability to build a real-world CRUD web application with full-stack implementation. It is developed with clear separation between frontend and backend, includes authenticated routes, and supports local file uploads and report aggregation. The codebase is suitable for extension with more advanced features such as notifications, SMS/email integration, map support, and mobile responsiveness.
