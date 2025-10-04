-- Delete duplicate blog posts (keep the newer ones)
DELETE FROM blog_posts 
WHERE id IN (
  '7c2b02c7-35f0-4d43-8079-c8b03659bbd7',
  'fff4387c-b6fa-49e8-80da-f1dd0d962131',
  'fa991200-43f3-4aaa-a0b2-af98293c8e2d',
  '936f0373-5f32-4473-a6da-7a9469ad1db8',
  '3d4a692e-b12d-4be9-a6bd-5502d660ab14'
);