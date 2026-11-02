import { supabase } from './supabaseClient';
import { FacialAnalysis } from '../types';

export interface StoredAnalysis {
  id: string;
  user_id: string;
  overall_score: number;
  scores: any[];
  recommendations: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export async function saveAnalysis(analysis: FacialAnalysis, imageUrl?: string): Promise<StoredAnalysis | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('facial_analyses')
      .insert({
        user_id: user.id,
        overall_score: analysis.overallScore,
        scores: analysis.scores,
        recommendations: analysis.recommendations,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return null;
  }
}

export async function getUserAnalyses(): Promise<StoredAnalysis[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('facial_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}

export async function deleteAnalysis(analysisId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('facial_analyses')
      .delete()
      .eq('id', analysisId);

    if (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return false;
  }
}

export async function getAnalysisById(analysisId: string): Promise<StoredAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('facial_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}