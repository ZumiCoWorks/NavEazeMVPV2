// src/services/DPMService.ts

import { supabase } from './supabase';

// This interface must include the new count fields
export interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  pois_count: number;
  routes_count: number;
  beacons_count: number;
}

// MODIFICATION: Use the corrected environment variable name
const DPM_FUNCTIONS_URL = process.env.DPM_FUNCTIONS_URL;

/**
 * Fetches the list of all available events from the DPM.
 * @returns {Promise<Event[]>} A promise that resolves to an array of events.
 */
export const fetchEvents = async (): Promise<Event[]> => {
  if (!DPM_FUNCTIONS_URL) {
    console.error("DPM functions URL is not configured in environment variables.");
    throw new Error("Application is not configured to connect to the events server.");
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.error("No active user session found. Cannot fetch events.");
    throw new Error("You must be logged in to view events.");
  }
  
  const response = await fetch(`${DPM_FUNCTIONS_URL}/get-events`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Failed to fetch events:", errorBody);
    throw new Error(errorBody.error || "Could not retrieve events from the server.");
  }

  const data = await response.json();
  return data.events || [];
};

/**
 * Fetches detailed event data including POIs, nodes, and segments for navigation
 * @param eventId - The ID of the event to fetch
 * @returns Promise<EventData> - Complete event data with map information
 */
export const fetchEventData = async (eventId: string): Promise<any> => {
  if (!DPM_FUNCTIONS_URL) {
    throw new Error("Application is not configured to connect to the events server.");
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You must be logged in to view event details.");
  }
  
  const response = await fetch(`${DPM_FUNCTIONS_URL}/get-event-data/${eventId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Failed to fetch event data:", errorBody);
    throw new Error(errorBody.error || "Could not retrieve event data from the server.");
  }

  const data = await response.json();
  return data;
};