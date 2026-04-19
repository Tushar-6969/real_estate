# Real Estate CRM (MERN)

A complete local Real Estate CRM application built with the MERN stack (MongoDB, Express, React, Node.js). This project is designed to showcase a recruiter-ready CRM implementation for lead management, property management, client management, deal tracking, and reporting.

## Key Features

- Authentication with JWT
- Demo account login
- Lead management with source, status tracking, and agent assignment
- Property listing management with image uploads
- Client profile creation and tracking
- Deal management with stages and commission calculations
- Dashboard reporting for lead count, property count, client count, deals, and commission totals
- Local development setup without AWS or cloud provider dependencies

## What makes this recruiter-ready

- Functional full-stack architecture with separate frontend and backend
- Real estate-specific CRM workflows implemented in code
- Local file uploads and image management
- Dashboard and summary analytics
- Clear extension points for advanced features like notifications, integrations, and reporting

## Project Structure

- `backend/` - Express API, MongoDB models, authentication, and CRUD routes
- `frontend/` - React + Vite user interface for managing leads, properties, clients, and deals

## Run locally

### Backend

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the browser at `http://localhost:5173`

## Notes

- The app is intentionally built without AWS to make the core CRM functionality easy to run and evaluate locally.
- The codebase is ready to be extended with notifications, email/SMS integration, map support, export reports, and mobile-friendly UX.
