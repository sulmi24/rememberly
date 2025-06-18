import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('Invalid Supabase URL format. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-app',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('notes').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          original_content: string;
          summary: string;
          type: 'text' | 'url' | 'file' | 'image';
          tags: string[];
          source_url: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          original_content: string;
          summary?: string;
          type?: 'text' | 'url' | 'file' | 'image';
          tags?: string[];
          source_url?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          original_content?: string;
          summary?: string;
          type?: 'text' | 'url' | 'file' | 'image';
          tags?: string[];
          source_url?: string | null;
          file_url?: string | null;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          note_id: string | null;
          user_id: string;
          remind_at: string;
          natural_input: string;
          is_completed: boolean;
          created_at: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          notification_id: string | null;
        };
        Insert: {
          id?: string;
          note_id?: string | null;
          user_id: string;
          remind_at: string;
          natural_input: string;
          is_completed?: boolean;
          created_at?: string;
          title: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          notification_id?: string | null;
        };
        Update: {
          remind_at?: string;
          natural_input?: string;
          is_completed?: boolean;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          notification_id?: string | null;
        };
      };
    };
  };
};