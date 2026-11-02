/*
# Enforce upload size and type limits on storage buckets

1. Security changes
   - The app only validated uploads in the browser (`file.type.startsWith('image/')`),
     which any direct API caller can skip. Buckets had no size or MIME restrictions,
     so arbitrary files of arbitrary size could be stored.
   - `user-images`, `user_uploads` and `nextface images` are now limited to 10 MB and
     to common image MIME types.

2. Notes
   - Legitimate photo uploads (jpeg, png, webp, heic) remain allowed.
*/

UPDATE storage.buckets
   SET file_size_limit = 10485760,
       allowed_mime_types = ARRAY[
         'image/jpeg','image/jpg','image/png','image/webp','image/heic','image/heif'
       ]
 WHERE id IN ('user-images', 'user_uploads', 'nextface images');
