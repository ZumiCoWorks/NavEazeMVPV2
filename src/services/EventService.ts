// src/services/EventService.ts
import { supabase } from './supabase';
import { fetchEvents, fetchEventData, Event as DPMEvent } from './DPMService';

// --- Types ---
export interface EventSummary {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  pois: number;
}

// Import POI type from main types file
import { POI } from '../types';

export interface Buddy {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  requester_id: string;
  addressee_id: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
  };
}

export interface BuddyLocation {
  user_id: string;
  email: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

// --- Helper Functions ---
const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getEventStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'Upcoming';
  if (now > end) return 'Past';
  return 'Active';
};

// --- Fallback Mock Data ---
const mockEvents: EventSummary[] = [
  {
    id: '1',
    name: 'Tech Conference 2024',
    location: 'Convention Center',
    date: 'Jan 15',
    status: 'Active',
    pois: 12
  },
  {
    id: '2',
    name: 'Music Festival',
    location: 'City Park',
    date: 'Feb 10',
    status: 'Active',
    pois: 8
  }
];

const mockPOIs: POI[] = [
  { id: '1', name: 'Registration Desk', type: 'service', x: 100, y: 150, description: 'Check-in and badge pickup' },
  { id: '2', name: 'Coffee Station', type: 'food', x: 200, y: 100, description: 'Free coffee and snacks' },
  { id: '3', name: 'Main Stage', type: 'venue', x: 300, y: 200, description: 'Main presentation area' },
  { id: '4', name: 'Exhibition Hall', type: 'venue', x: 400, y: 180, description: 'Vendor booths and demos' },
  { id: '5', name: 'Networking Lounge', type: 'social', x: 150, y: 250, description: 'Casual meeting space' },
  { id: '6', name: 'Restrooms', type: 'service', x: 50, y: 200, description: 'Public facilities' }
];

// --- Service Functions ---

export const getEventSummaries = async (): Promise<EventSummary[]> => {
  try {
    // Try to fetch from DPM service first
    const dpmEvents = await fetchEvents();
    
    return dpmEvents.map((event: DPMEvent) => ({
      id: event.id,
      name: event.name,
      location: event.venue_name,
      date: formatEventDate(event.start_date),
      status: getEventStatus(event.start_date, event.end_date),
      pois: event.pois_count || 0
    }));
  } catch (error) {
    console.warn('Failed to fetch events from DPM, using mock data:', error);
    // Fallback to mock data if DPM service fails
    return mockEvents;
  }
};

export const getEventPOIs = async (eventId: string): Promise<POI[]> => {
  try {
    // Try to fetch real event data from DPM
    const eventData = await fetchEventData(eventId);
    
    if (eventData && eventData.pois) {
      return eventData.pois.map((poi: any) => ({
        id: poi.id,
        name: poi.name,
        type: poi.type || 'venue',
        x: poi.x,
        y: poi.y,
        description: poi.description || 'No description available'
      }));
    }
    
    return mockPOIs;
  } catch (error) {
    console.warn('Failed to fetch POIs from DPM, using mock data:', error);
    // Fallback to mock data if DPM service fails
    return mockPOIs;
  }
};

/**
 * Fetches complete event data including navigation information
 * @param eventId - The ID of the event
 * @returns Promise with complete event data
 */
export const getEventData = async (eventId: string): Promise<any> => {
  try {
    return await fetchEventData(eventId);
  } catch (error) {
    console.error('Failed to fetch event data:', error);
    throw error;
  }
};

// --- Buddy Service Functions ---

export const getBuddies = async (): Promise<{ requests: Buddy[], friends: Buddy[] }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('buddies')
    .select('*, profiles:addressee_id(id, email), requester:requester_id(id, email)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    console.error('Error fetching buddies:', error);
    // Return mock data for development
    return { requests: [], friends: [] };
  }
  
  const mappedData = data?.map(b => ({
      ...b,
      profiles: b.requester_id === user.id ? b.requester : b.profiles
  })) || [];

  const requests = mappedData.filter(b => b.status === 'pending' && b.addressee_id === user.id);
  const friends = mappedData.filter(b => b.status === 'accepted');

  return { requests, friends };
};

export const addBuddyByEmail = async (email: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // For MVP, we'll simulate this functionality
  console.log(`Adding buddy with email: ${email}`);
  
  // In a real implementation, this would:
  // 1. Find user by email
  // 2. Create buddy relationship
  // 3. Send notification
};

export const updateBuddyStatus = async (relationshipId: string, status: 'accepted' | 'declined'): Promise<void> => {
  const { error } = await supabase
    .from('buddies')
    .update({ status })
    .eq('id', relationshipId);

  if (error) {
    console.error('Error updating buddy status:', error);
    throw error;
  }
};

export const deleteBuddy = async (relationshipId: string): Promise<void> => {
  const { error } = await supabase
    .from('buddies')
    .delete()
    .eq('id', relationshipId);

  if (error) {
    console.error('Error deleting buddy:', error);
    throw error;
  }
};

export const getBuddyLocations = async (): Promise<BuddyLocation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  // For MVP, return mock data
  return [];
};