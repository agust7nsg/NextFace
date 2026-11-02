import { supabase } from './supabaseClient';

export interface ChatMessageRow {
  id: string;
  user_id: string;
  analysis_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function saveChatMessage(
  userId: string,
  analysisId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({
    user_id: userId,
    analysis_id: analysisId,
    role,
    content,
  });

  if (error) {
    console.error('Failed to save chat message:', error);
  }
}

export async function getChatMessages(
  userId: string,
  analysisId: string
): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, user_id, analysis_id, role, content, created_at')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load chat messages:', error);
    return [];
  }
  return data ?? [];
}
