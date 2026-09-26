# Mobile group cover image

## What will change
- Add an optional 4:3 mobile cover image URL to each group.
- Add a clearly labeled field in the group management panel.
- Use the mobile image on small screens and keep the existing cover on larger screens.
- Fall back to the existing cover when no mobile image is provided.

## Technical details
- Add the new nullable field through a database migration without changing existing group records.
- Extend the shared group data shape and save flow.
- Render the group cover with responsive image sources and a 4:3 mobile frame.
- Verify saving and both mobile and desktop displays.
