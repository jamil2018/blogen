-- Unsplash removed photo-1516116218424-4d5baa4b0b8f (404), which broke Next.js hero image optimization.
update posts
set cover_url = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80'
where cover_url = 'https://images.unsplash.com/photo-1516116218424-4d5baa4b0b8f?auto=format&fit=crop&w=1600&q=80';
