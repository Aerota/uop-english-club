# Homepage teachers’ panel

## What will change
Replace the existing “Guided by our teachers” introduction in the selected homepage section.
- Add a Teachers’ Panel heading and member cards beneath it, using the same live names, roles, biographies, photos, and ordering already shown on the About page.
- Show three teacher cards per row on desktop, two on medium screens, and one on phones.
- Keep a clear link to the About page for the full panel and committees.
- Show the same initials fallback used on the About page when a member has no photo.

## Technical details
- Reuse the existing `panelsQuery` data source and filter it to the `teachers` panel, so changes made in the portal automatically update both pages.
- Update only the homepage presentation; no database or portal behavior changes are needed.
- Verify the homepage at desktop and mobile sizes and confirm the project builds cleanly.
