<div align="center">
  <a href="https://github.com/GevaX/BunkerSC">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="src/assets/logo.svg">
      <img src="public/logo-black.svg" alt="Logo">
    </picture>
  </a>
  <p>A web-based social credit system.</p>
</div>

# BunkerSC

BunkerSC is a social credit tracking app for a group. Members can submit point requests for recognition or corrective action, while a leaderboard and activity feed show the current standings. Administrators review pending submissions and approve or reject them through a protected admin portal.

## Overview

This project combines a React frontend with a Supabase-backed data layer and Vercel serverless APIs. It is designed for lightweight internal use, for a visible leaderboard and a simple moderation workflow for point submissions.

### Core functionality

- Public leaderboard of member scores
- Activity feed for approved transactions
- Member detail modal with transaction history
- Submit social credit request form
- Admin portal with passcode-based authentication
- Admin actions to approve or reject pending submissions
- User management for adding or removing group members
- Real-time refreshes when database data changes

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase JS client
- Vercel serverless functions

## Project structure

- `src/` — frontend app and UI components
- `api/` — Vercel API handlers for admin auth and admin actions
- `supabase/schema.sql` — database schema and leaderboard view
- `public/` — static assets

## Prerequisites

- **Node.js** 18+ and **npm**
- A **Supabase** project
- A Vercel project if you want to deploy

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/GevaX/BunkerSC
cd BunkerSC
```

### 2. Download dependencies

```bash
npm install
```

### 3. Set up environment variables

Add your environment variables as listed in `.env.example`

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used by the frontend to read public data.
- `ADMIN_PASSCODE` protects the admin login flow.
- `ADMIN_SESSION_SECRET` signs the admin session cookie used by the Vercel API routes.
- `SUPABASE_SERVICE_ROLE_KEY` is required for authenticated admin mutations such as approving transactions and adding users.

## Usage

### Development mode

Start vite frontend

```bash
npm run dev
```

To run together with vercel api

```bash
npx vercel run
```
