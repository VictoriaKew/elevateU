# ElevateU

Standalone Next.js + Supabase application. It has no Softr runtime dependency.

## Start locally

1. Run `npm install` then copy `.env.example` to `.env.local`.
2. Create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql), and enable Google in **Authentication → Providers**. Add `http://localhost:3000/auth/callback` as a redirect URL.
3. Add the Supabase project URL and anon key to `.env.local`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
4. Run `npm run dev`.

## Google Sheets import

Create a Google Cloud API key restricted to the Google Sheets API and to your spreadsheet. Fill `GOOGLE_SHEETS_API_KEY`, `GOOGLE_SHEETS_ID`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `SHEETS_IMPORT_SECRET` in `.env.local`.

To import `RoadMap_Content` or `Wellness`, issue an authenticated server request to `POST /api/import/google-sheets` with JSON `{ "sheet": "RoadMap_Content" }` or `{ "sheet": "Wellness" }` and header `x-import-secret`. The service role and import secret never reach browser code.

Before production, export the original Sheet formulas and replace the starter assessment scorer with those exact rules. The existing formulas were not accessible through the Softr connector, so they were intentionally not guessed.
