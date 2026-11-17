Add a new section called **Used Car Manager** inside the **Common** module of this dashboard. Do not call it "Admin" or "Admin Panel" anywhere: not in the menu, page titles, routes or code names. Use "Used Car Manager" and a route such as `/common/used-car-manager`.

Follow this dashboard's existing patterns: layout, navigation, components, auth and roles, data fetching, forms, toasts and styling. Read how the other Common sections are built and match them. Don't add a new UI library.

## What it is for

The company's used-car website, **usedcarsjammu.com**, is a separate Next.js app. It reads its stock from, and writes its enquiries to, the **same Supabase project this dashboard already uses** (`jfcpvznzlwxqxaznkmar`). The Used Car Manager is where staff:

1. add, edit and publish used cars, mark them sold, and delete them;
2. work the enquiries (leads) the website sends in.

The website shows whatever is in these tables, so a save here changes the public site. **Do not change the tables' structure, names or constraints, and do not touch any other table for this feature.** The website depends on the exact shapes below.

## Data access, and the security rules for it

- Read and write these tables on the **server only**, with the service-role/secret key this dashboard already has for this project. Use server actions or API routes.
- Row Level Security is ON with **no policies**, so the anon/publishable key cannot read them. That is on purpose: leads hold customers' names and phone numbers. Do not add RLS policies, and never query these tables from the browser.
- Only signed-in dashboard users with the right role may open the section. Check the role on the server for every read and write, not just in the menu.
- Never log or display the secret key.

## Table: `public.used_cars`

| column | type | rules |
|---|---|---|
| id | bigint PK | Set by the database sequence for new cars (100000 and up). Never edit an id. It is in the public URL, the Meta ads catalogue and old leads. |
| status | text | `draft` (saved, not on the site), `published` (on the site and in Meta ads), `sold` (off sale; the site shows a "Sold" page for 30 days) |
| title | text, required | Make + model as buyers read it, without the year, e.g. "Hyundai Creta". Max 120 |
| make | text, required | Max 60, e.g. "Hyundai" |
| model | text, required | Max 60, e.g. "Creta" |
| variant | text | The trim, e.g. "1.5 MPi IVT SX(O)". Max 80. Strongly encourage filling it in: it shows in the page heading and in Google's data |
| year | int | 1980–2100 |
| price | bigint | Asking price in whole rupees |
| original_price | bigint | The higher, struck-through price. Must be ≥ price when both are set |
| mileage_km | int | 0–2,000,000 |
| fuel | text | One of: Petrol, Diesel, CNG, Electric, Hybrid |
| transmission | text | Manual or Automatic |
| drivetrain | text | Max 30 |
| body_type | text | Hatchback, Premium Hatchback, Sedan, Compact SUV, SUV, Premium SUV, MPV, MUV |
| colour | text | Max 40 |
| engine | text | Max 60, e.g. "1.5L Petrol" |
| condition | text | "Certified Used" or "Used Cars" |
| owners | int | 1–10 |
| registration | text | The series only, e.g. `JK02`, matching `^[A-Z]{2}\d{1,2}[A-Z]{0,3}$` after upper-casing and removing spaces/hyphens. **Refuse a full number plate** (it identifies the previous owner); don't silently trim it |
| location_slug | text | One of: `jammu` (AM Business Park), `nanak-nagar` (AM Hyundai Gandhi Nagar), `gangyal` (AM Auto Square, Gangyal), `paloura` (AM Hyundai Paloura), `am-kia` (AM Kia, Kia Certified Pre-Owned) |
| description | text | Max 5000 |
| images | text[] | Public photo URLs in display order; the **first is the cover**. At most 40 for a new car; a car that already has more keeps them |
| source | text | `admin` for cars created here. Imported cars say `wordpress`; leave it |
| source_url | text | Old WordPress address, used for redirects. Show it read-only; never edit it |
| posted_at | timestamptz | Listing date; defaults to now. Editable |
| created_at, updated_at | timestamptz | Set by the database (a trigger updates `updated_at`). Don't write them |

Trim text fields and store empty ones as null. Show clear, field-level validation messages.

### Photos: Supabase Storage bucket `car-photos` (public)

- Accept only JPEG, PNG or WebP, up to 8 MB each. Take the file extension from the content type, never from the user's file name.
- **Upload straight from the browser to storage with a signed upload URL** that the server creates (`createSignedUploadUrl`), so large phone photos never pass through your server.
- Path: `<car id, or a temporary key for an unsaved car>/<random uuid>.<ext>`. Store the object's public URL (`getPublicUrl`) in `images`.
- When saving, only accept image URLs that start with this project's `.../storage/v1/object/public/car-photos/` prefix, or that were already on the car. Otherwise the form becomes a way to put any outside address on the public site.
- Let staff upload several photos at once, reorder them by drag and drop, set the cover (first), and remove photos. Show upload progress.
- When a photo is removed from a car, or a car is deleted, delete its file from storage. **Skip any file another car's `images` still uses** (check with an array overlap query).

### Screens

1. **List:**
   - A table of all cars with: cover thumbnail, year + title + variant, price, km, location, status, photo count, and last updated.
   - Search across title, make, model, variant, year, registration and id.
   - Filters by status and location; newest first.
   - Quick actions on each row:
     - Edit.
     - Mark sold / put back on sale.
     - Publish / unpublish.
     - Open on website: `https://usedcarsjammu.com/inventory/<slug>`, where the slug is `make-model-year-id` in lower case with spaces as hyphens, e.g. `kia-seltos-2024-5579`.
2. **Add / Edit form:**
   - Every field above, with dropdowns for the fixed lists and the photo manager.
   - Save as draft or publish.
   - Delete, with a confirmation that names the car and says it cannot be undone. Suggest "Mark sold" instead for a car that sold.
3. **Summary counts** at the top: published, drafts, sold in the last 30 days.

## Leads: `public.leads` and `public.lead_activities`

The website creates leads (enquiries from car pages, the sell-your-car valuation form, test drives, contact form, timed pop-up). It also emails each one to the team. This section is where they are worked.

`leads` columns:
- id uuid
- customer_name, customer_phone, customer_email
- message
- status — one of `New, Contacted, Follow-up, Qualified, Won, Lost` (a CHECK constraint)
- intent — e.g. General, Vehicle Enquiry, Test Drive, Sell Your Car
- source_path, source_label — which page and button the enquiry came from
- listing_id (= `used_cars.id` when the enquiry is about a car), listing_title, listing_price, listing_url
- assigned_to (text)
- next_follow_up_at (timestamptz)
- consent (bool)
- inquiry_type, vehicle_id, dealership_id — legacy; read-only, don't use for new logic
- created_at, updated_at

`lead_activities` columns: id uuid, lead_id (FK → leads, cascade delete), type, body, from_status, to_status, author, created_at.
- `type` is one of `created, note, status_change, call, whatsapp, email, follow_up_scheduled, assigned`.
- The website writes a `note` with the visitor's source (ad campaign, Google, etc.). Show it.

### Screens

1. **Lead list:**
   - Columns: newest first, name, phone, intent, the car (linked to its car in the manager), status, assigned to, next follow-up, received.
   - Filters: status, intent, assigned to, "follow-up due today/overdue", and date range. Search by name and phone.
   - Bulk status change.
   - CSV export of the filtered rows, restricted to roles allowed to export customer data.
2. **Lead detail:**
   - Customer details, and buttons to call (`tel:`) and WhatsApp (`https://wa.me/<digits>`).
   - The car they asked about, with a link.
   - Status changer: writes a `status_change` activity with `from_status`/`to_status`.
   - Assign to a person: writes an `assigned` activity.
   - Schedule a follow-up: sets `next_follow_up_at` and writes a `follow_up_scheduled` activity.
   - Add a note.
   - Log a call, WhatsApp or email.
   - Show the full activity timeline, newest first, with author and time.
   - Every activity's `author` is the signed-in dashboard user's name.
3. **Overdue follow-ups badge** on the section's menu item, if the dashboard has badges.

Do not let anyone edit a lead's original message, source or created date; they are the record of what the customer sent.

## How the website picks up changes

- The website caches its stock for about **5 minutes**, so a car saved here appears, changes or disappears on usedcarsjammu.com within 5 minutes. Say this in the UI after a save, e.g. "Saved. The website updates within 5 minutes."
- Meta ads read the website's feed hourly, so a sold car leaves the ads within the hour.
- Do not try to clear the website's cache from the dashboard unless the website provides a refresh endpoint for it (if one is added later it will be documented separately).

## Done when

- A new car can be added with photos, saved as a draft, published, and seen on usedcarsjammu.com within 5 minutes.
- An existing car (e.g. id 5579) can be edited without losing its photos or changing its id.
- A car can be marked sold and back, and deleted. Deleting removes its unshared photos from storage.
- A full number plate is refused with a clear message, and so are a price above the original price and a photo URL from outside the bucket.
- Leads list, filter, open, change status, assign, schedule a follow-up and take notes. Each action adds the right activity row.
- Nothing in the browser can read `used_cars`, `leads` or `lead_activities` directly. Check the network tab: every request goes through your server.
- The section is called "Used Car Manager" everywhere and sits in the Common module.
