# Moving the website to a new Supabase project

Moves only what the website owns: `used_cars`, `leads`, `lead_activities`, the `car-photos` bucket (400 photos, ~52 MB) and the `am_group_files` bucket (branch photos, ~4 MB). The old project also holds another app's tables (workshop vehicles, credentials, logs). None of those are read or touched.

Car ids are kept, because they are in every car URL, the Meta catalogue and old leads.

## Before you start

- **Use a project that has no `used_cars`, `leads` or `lead_activities` table.** Step 1 refuses to run otherwise, so it cannot damage another app's data.
- **Region.** Pick Mumbai (`ap-south-1`) for the new project if you can; the site is built in Mumbai.
- **Keys go in `.env` only, never in chat.** From the new project, add these to `.env`:
  ```
  NEW_SUPABASE_URL=https://<new-ref>.supabase.co
  NEW_SUPABASE_SERVICE_ROLE_KEY=<new service_role key>
  ```
  You'll find both in Project Settings → API.

## Steps

1. **Schema.** Run [`01-schema.sql`](01-schema.sql) in the new project's SQL editor.
2. **Dry run.** Run `npm run db:move`. It checks both projects and prints what it would copy, and writes nothing.
3. **Pause edits.** Ask staff not to add or edit cars in `/admin/vehicles` until step 7.
4. **Copy.** Run `npm run db:move -- --apply`.
   - It copies files, then rows, then checks every car photo loads from the new project.
   - It ends with `All copied` or with a list of problems.
   - You can run it again at any point: it only adds what is missing and never overwrites.
5. **Id counter.** Run [`03-after-copy.sql`](03-after-copy.sql) in the new SQL editor. Its counts must match the script's.
6. **Switch the website.**
   - In Vercel → am-group-jammu → Settings → Environment Variables, change these for Production and Preview:
     - `NEXT_PUBLIC_SUPABASE_URL` → the new URL
     - `SUPABASE_SERVICE_ROLE_KEY` → the new service_role key
     - `SUPABASE_ANON_KEY` → the new anon key, if it is set there
   - Redeploy. `NEXT_PUBLIC_*` values are baked in at build time, so a redeploy is required.
   - Update the same three in your local `.env` as well.
7. **Catch late leads.**
   - In `.env`, set `OLD_SUPABASE_URL` and `OLD_SUPABASE_SERVICE_ROLE_KEY` to the old project.
   - Run `npm run db:move -- --apply` once more. It picks up enquiries that arrived during the switch.
   - Run `03-after-copy.sql` again.
   - Staff can use the admin again.

## Check

- Pages load: home, `/inventory`, any car page, and a showroom page (branch photos).
- `/admin/vehicles` lists 20 cars.
- `/admin/leads` shows every lead.
- `https://usedcarsjammu.com/api/feed/meta?format=json` shows `"available": 20`.

## Do not delete the old project yet

Google's image index and the Meta catalogue's cached copies still point at the old photo addresses. They refresh within a few weeks, after the new feed is fetched and pages are re-crawled. The old project also holds another app's tables.

When the move is confirmed, delete the moved data from the old project, so customer phone numbers aren't kept in two places:
- the three tables
- the `car-photos` bucket
