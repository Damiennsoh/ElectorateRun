# ElectorateRun

ElectorateRun is a comprehensive platform for creating and managing secure, customizable elections. Built with React, TypeScript, and Tailwind CSS, it offers election administrators an intuitive interface to configure ballots, manage voters, configure email templates, and analyze election results. The backend is powered by Supabase.

## Features

- **Authentication:** Secure user signup and login via Supabase.
- **Dashboard:** Overview of all active, draft, and completed elections.
- **Election Creation & Configuration:**
  - Define election title, dates, and timezone.
  - Set up multiple-choice and ranked-choice ballot questions.
  - Add standard or write-in options.
- **Voter Management:**
  - Add voters manually or import a large list of voters via a CSV template.
  - Configure weighted voting to give specific voters more voting power.
  - Manage unique Voter IDs and Voter Keys for secure authentication.
- **Email Settings:**
  - Customize the voting invite template and automated reminder emails.
  - Enable automatic voter login via secure email links.
- **Election Results:**
  - View real-time participation statistics and final election results.
  - Configure settings to hide results during active elections.
- **Election Duplication:** Seamlessly duplicate previous elections (including settings and ballots) to save time for recurring events.
- **Fraud Analysis:** Advanced metrics to detect unusual voting patterns.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router v6
- **Styling:** Tailwind CSS, React Icons
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- A Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ELECTION-RUNNER/election-voting-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `election-voting-app` root directory and configure your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Run the SQL commands found in the `supabase_schema.sql` file in your Supabase SQL editor to create the necessary tables and relationships.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to `http://localhost:5173` to view the app.

## Project Structure

- `/src/components` - Reusable UI components (buttons, modals, layout elements).
- `/src/pages` - Main application views (Dashboard, Create Election, Results, etc.).
- `/src/utils` - Utility functions and API integrations (`api.ts`, `supabase.ts`).
- `/public` - Static assets and downloadable templates (e.g., CSV import templates).

## Deployment

The application can be deployed to platforms such as Vercel, Netlify, or AWS. This repository contains the frontend app in the `election-voting-app` folder (a Vite + React project) and Supabase SQL/functions under `supabase/`.

**Vercel (recommended for quick deployments)**

- Project root: set to `election-voting-app` when creating the Vercel project (or set the "Root Directory" in the Vercel UI).
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Notes:
- This repo includes `election-voting-app/vercel.json` which configures Vercel to use `@vercel/static-build` and routes all requests to `index.html` so client-side routing works (single-page app).
- Ensure the following environment variables are set in Vercel (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

If your production Supabase project uses server-side keys or service roles, keep those secrets out of the client bundle and use serverless functions (e.g., Supabase Edge Functions or Vercel Serverless Functions) to proxy requests.

Quick manual deploy steps:

1. In Vercel, click "New Project" → import your Git repository.
2. Set the **Root Directory** to `election-voting-app`.
3. Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy — Vercel will run `npm install` and `npm run build`, then publish the `dist` folder.

Local preview of a production build:

```bash
cd election-voting-app
npm install
npm run build
npm run preview
```


## Support

If you need help or have questions about importing voters, creating ballots, or launching an election, please check the built-in **Help & Support** center (`/help`).
