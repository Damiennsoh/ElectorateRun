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

The application can be easily deployed using platforms like Vercel, Netlify, or AWS by linking your repository and configuring the environment variables for your production Supabase project.

## Support

If you need help or have questions about importing voters, creating ballots, or launching an election, please check the built-in **Help & Support** center (`/help`).
