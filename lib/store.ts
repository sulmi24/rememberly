import { create } from 'zustand';
import { supabase, Database } from './supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type Reminder = Database['public']['Tables']['reminders']['Row'];

interface NotesState {
  notes: Note[];
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<Note | null>;
  createReminder: (reminder: Omit<Reminder, 'id' | 'created_at'>) => Promise<Reminder | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  clearError: () => void;
  setOfflineMode: (offline: boolean) => void;
}

// Helper function to handle network errors
function handleNetworkError(error: any): string {
  console.error('Network error in store:', error);
  
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('Network request failed') ||
      error.message?.includes('NetworkError')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  reminders: [],
  loading: false,
  error: null,
  isOffline: false,

  fetchNotes: async () => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      set({ notes: data || [], loading: false });
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
    }
  },

  fetchReminders: async () => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*, notes!inner(*)')
        .eq('is_completed', false)
        .order('remind_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      set({ reminders: data || [], loading: false });
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
    }
  },

  createNote: async (noteData) => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({ ...noteData, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const currentNotes = get().notes;
      set({ notes: [data, ...currentNotes], loading: false });
      return data;
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
      return null;
    }
  },

  createReminder: async (reminderData) => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert({ ...reminderData, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const currentReminders = get().reminders;
      set({ reminders: [...currentReminders, data], loading: false });
      return data;
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
      return null;
    }
  },

  updateNote: async (id, updates) => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      const currentNotes = get().notes;
      const updatedNotes = currentNotes.map(note => 
        note.id === id ? { ...note, ...updates } : note
      );
      set({ notes: updatedNotes, loading: false });
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
    }
  },

  deleteNote: async (id) => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      const currentNotes = get().notes;
      const filteredNotes = currentNotes.filter(note => note.id !== id);
      set({ notes: filteredNotes, loading: false });
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
    }
  },

  completeReminder: async (id) => {
    try {
      set({ loading: true, error: null, isOffline: false });
      
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      const currentReminders = get().reminders;
      const filteredReminders = currentReminders.filter(reminder => reminder.id !== id);
      set({ reminders: filteredReminders, loading: false });
    } catch (error) {
      const errorMessage = handleNetworkError(error);
      const isNetworkError = errorMessage.includes('Unable to connect');
      
      set({ 
        error: errorMessage, 
        loading: false,
        isOffline: isNetworkError
      });
    }
  },

  clearError: () => set({ error: null }),
  setOfflineMode: (offline: boolean) => set({ isOffline: offline }),
}));