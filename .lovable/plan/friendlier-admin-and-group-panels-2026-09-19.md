# Friendlier admin and group panels

## What will change
- Replace the crowded row of tabs with a clear workspace: a desktop side menu and a compact mobile section selector.
- Add task-focused sections for content, group details, members, activity names, gallery, panels, and account settings.
- For admins, add one persistent group selector at the top. Group-specific sections will edit only the selected group, avoiding repeated group pickers and long lists of every group.
- Add useful group context and counts so the admin can confirm which group is being edited.
- Keep group accounts focused on their own group, with the same simpler navigation and mobile layout.
- Improve forms and item rows for small screens, including full-width controls and actions that wrap cleanly.

## Activity type labels
- Keep the four fixed activity types and their existing behavior/order.
- Add an admin-only editor for their displayed names (for example, changing “Presentations” to another label).
- Update the public group pages and content forms automatically through the existing activity data.
- Group accounts can manage activity names inside each type, but cannot rename the fixed types.

## Technical details
- Use the existing admin-only permission already applied to activity types; no new role or database structure is needed.
- Pass the admin’s selected group into content, activity-name, member, gallery, and group-detail editors.
- Preserve existing uploads, albums, members, activity names, and content without data conversion.
- Verify the admin and group views at desktop and phone sizes, and check editing flows and type-label updates.
