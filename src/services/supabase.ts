import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// REPLACE WITH YOUR ACTUAL SUPABASE URL AND ANON KEY
// Get these from your Supabase dashboard

// Mobile App Supabase Project - Handles AR Navigation & Attendees
const supabaseUrl = 'https://dxadgyuzeilnoqfxgcrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YWRneXV6ZWlsbm9xZnhnY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDIwMTUsImV4cCI6MjA2NjY3ODAxNX0.DTqZwsPKUS9_wQuxznaHlKhhFHiPBP-uEvn87mG8t7Y';

// -------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;