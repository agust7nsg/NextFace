import { supabase } from './supabaseClient';

const BUCKET = 'user-images';
const EXPIRY_SECONDS = 3600;

export async function deleteStorageFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error('Failed to delete storage file:', path, error);
  }
}

export async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRY_SECONDS);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function uploadImage(
  file: File,
  userId: string
): Promise<{ path: string; signedUrl: string } | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) return null;

  const signedUrl = await getSignedUrl(filePath);
  if (!signedUrl) return null;

  return { path: filePath, signedUrl };
}
