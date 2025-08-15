// src/services/FeedbackService.ts
import { supabase } from './supabase';
import { VenueFeedback } from '../types';

// Mock feedback data for development
const mockFeedback: VenueFeedback[] = [
  {
    id: '1',
    targetType: 'event',
    targetId: 'event1',
    targetName: 'Tech Conference 2024',
    rating: 5,
    comment: 'Amazing event! Great speakers and excellent organization.',
    category: 'general',
    timestamp: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: '2',
    targetType: 'venue',
    targetId: 'venue1',
    targetName: 'Convention Center',
    rating: 4,
    comment: 'Good facilities but could use better signage for navigation.',
    category: 'navigation',
    timestamp: new Date('2024-01-15T14:20:00Z'),
  },
  {
    id: '3',
    targetType: 'poi',
    targetId: 'poi1',
    targetName: 'Main Auditorium',
    rating: 3,
    comment: 'Sound quality could be improved. Hard to hear from the back.',
    category: 'facilities',
    timestamp: new Date('2024-01-15T16:45:00Z'),
  },
];

export class FeedbackService {
  /**
   * Submit new feedback
   */
  static async submitFeedback(
    feedback: Omit<VenueFeedback, 'id' | 'timestamp'>
  ): Promise<VenueFeedback> {
    try {
      const newFeedback: VenueFeedback = {
        ...feedback,
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      // Try to submit to Supabase
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            target_type: feedback.targetType,
            target_id: feedback.targetId,
            target_name: feedback.targetName,
            rating: feedback.rating,
            comment: feedback.comment,
            category: feedback.category,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Failed to submit to Supabase, using local storage:', error);
        // Fallback to local storage
        mockFeedback.push(newFeedback);
        return newFeedback;
      }

      // Convert Supabase response to our format
      return {
        id: data.id.toString(),
        targetType: data.target_type,
        targetId: data.target_id,
        targetName: data.target_name,
        rating: data.rating,
        comment: data.comment,
        category: data.category,
        timestamp: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Fallback to local storage
      const newFeedback: VenueFeedback = {
        ...feedback,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      mockFeedback.push(newFeedback);
      return newFeedback;
    }
  }

  /**
   * Get feedback for a specific target
   */
  static async getFeedbackForTarget(
    targetType: string,
    targetId: string
  ): Promise<VenueFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch from Supabase, using mock data:', error);
        return mockFeedback.filter(
          (f) => f.targetType === targetType && f.targetId === targetId
        );
      }

      return data.map((item) => ({
        id: item.id.toString(),
        targetType: item.target_type,
        targetId: item.target_id,
        targetName: item.target_name,
        rating: item.rating,
        comment: item.comment,
        category: item.category,
        timestamp: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return mockFeedback.filter(
        (f) => f.targetType === targetType && f.targetId === targetId
      );
    }
  }

  /**
   * Get all feedback (for admin purposes)
   */
  static async getAllFeedback(): Promise<VenueFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch from Supabase, using mock data:', error);
        return mockFeedback;
      }

      return data.map((item) => ({
        id: item.id.toString(),
        targetType: item.target_type,
        targetId: item.target_id,
        targetName: item.target_name,
        rating: item.rating,
        comment: item.comment,
        category: item.category,
        timestamp: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      return mockFeedback;
    }
  }

  /**
   * Get feedback statistics for a target
   */
  static async getFeedbackStats(
    targetType: string,
    targetId: string
  ): Promise<{
    averageRating: number;
    totalCount: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const feedback = await this.getFeedbackForTarget(targetType, targetId);
    
    if (feedback.length === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: {},
      };
    }

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedback.length;

    const ratingDistribution: { [key: number]: number } = {};
    feedback.forEach((f) => {
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalCount: feedback.length,
      ratingDistribution,
    };
  }

  /**
   * Get recent feedback across all targets
   */
  static async getRecentFeedback(limit: number = 10): Promise<VenueFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch from Supabase, using mock data:', error);
        return mockFeedback
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      }

      return data.map((item) => ({
        id: item.id.toString(),
        targetType: item.target_type,
        targetId: item.target_id,
        targetName: item.target_name,
        rating: item.rating,
        comment: item.comment,
        category: item.category,
        timestamp: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Error fetching recent feedback:', error);
      return mockFeedback
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    }
  }
}

export default FeedbackService;