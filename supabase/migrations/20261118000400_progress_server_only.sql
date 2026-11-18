-- Apply AFTER the app version with /api/lesson-complete is deployed.
-- Progress is written by the server from then on; clients only read it.
revoke insert, update on public.child_progress from authenticated;
