ALTER TABLE users ADD COLUMN permissions TEXT;
ALTER TABLE users ADD COLUMN assigned_classes TEXT;
ALTER TABLE users ADD COLUMN approval_required INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN reporting_to INTEGER REFERENCES users(id);

-- Upgrade existing Admin users to Super Admin so they don't lose access
UPDATE users SET role = 'Super Admin' WHERE role = 'Admin';
