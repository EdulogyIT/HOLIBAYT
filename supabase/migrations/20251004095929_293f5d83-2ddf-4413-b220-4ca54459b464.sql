-- Add admin role to user_roles table for the admin user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM profiles
WHERE role = 'admin' AND id NOT IN (SELECT user_id FROM user_roles WHERE role = 'admin')
ON CONFLICT (user_id, role) DO NOTHING;