// src/types/index.ts

// --- Navigation Types ---
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventDetails: { eventId: string };
  ARNavigation: { targetPOI: POI };
  BuddyProfile: { buddyId: string };
};

export type MainTabParamList = {
  Events: undefined;
  Map: undefined;
  Buddies: undefined;
  Profile: undefined;
};

// --- Event Types ---
export interface EventSummary {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  pois: number;
}

export interface POI {
  id: string;
  name: string;
  type: 'service' | 'food' | 'venue' | 'social' | 'emergency';
  x: number;
  y: number;
  description?: string;
  icon?: string;
}

export interface EventData {
  id: string;
  name: string;
  description?: string;
  location: string;
  date: string;
  pois: POI[];
  floorplan: {
    id: string;
    name: string;
    image_url?: string;
    width: number;
    height: number;
  };
}

// --- User & Auth Types ---
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// --- Buddy System Types ---
export type BuddyStatus = 'pending' | 'accepted' | 'declined';

export interface Buddy {
  id: string;
  email: string;
  status: BuddyStatus;
  requester_id: string;
  addressee_id: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface BuddyLocation {
  user_id: string;
  email: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

// --- Location & AR Types ---
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ARMarker {
  id: string;
  position: Location;
  title: string;
  description?: string;
  type: 'poi' | 'buddy' | 'exit';
}

// --- UI Component Types ---
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
}

// --- Feedback Types ---
export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  user_id: string;
}

export interface VenueFeedback {
  id: string;
  targetType: 'event' | 'venue' | 'poi';
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  category: string;
  timestamp: Date;
}

// --- Access Control Types ---
export interface AccessLevel {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserAccess {
  user_id: string;
  event_id: string;
  access_level: AccessLevel;
  granted_at: string;
  expires_at?: string;
}

// --- Common Utility Types ---
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}