// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with comprehensive error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase auth error:', error);
          // Handle specific error types
          if (error.message.includes('fetch')) {
            setError('Unable to connect to authentication service. Please check your internet connection and try again.');
          } else {
            setError(`Authentication error: ${error.message}`);
          }
        } else {
          setUser(session?.user ? mapSupabaseUser(session.user) : null);
          setError(null); // Clear any previous errors
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to initialize auth:', error);
        if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
          setError('Network connection failed. Please check your internet connection and try again.');
        } else {
          setError('Authentication service is temporarily unavailable. Please try again later.');
        }
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name,
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    created_at: supabaseUser.created_at,
  });

  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      throw error;
    }
    
    setLoading(false);
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      throw error;
    }
    
    setLoading(false);
  };

  const signOut = async (): Promise<void> => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
};