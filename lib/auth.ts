import { supabase } from './supabase';

// Helper function to handle network errors
function handleNetworkError(error: any): { data: null; error: { message: string } } {
  console.error('Network error:', error);
  
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
    return {
      data: null,
      error: {
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      }
    };
  }
  
  return {
    data: null,
    error: {
      message: error.message || 'An unexpected error occurred. Please try again.'
    }
  };
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    return handleNetworkError(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    return handleNetworkError(error);
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: { message: 'Failed to sign out. Please try again.' } };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Handle stale JWT session error
    if (error && error.message === 'Session from session_id claim in JWT does not exist') {
      // Clear the invalid session
      await supabase.auth.signOut();
      return { user: null, error: null };
    }
    
    if (error) {
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
      // Return null user for network errors to allow offline usage
      return { user: null, error: null };
    }
    
    return { user: null, error: { message: 'Failed to get user information.' } };
  }
}