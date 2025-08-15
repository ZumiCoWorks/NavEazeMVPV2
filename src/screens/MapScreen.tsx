// src/screens/MapScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Coffee, Users, AlertCircle, MessageSquare, Route } from 'lucide-react-native';
import { POI } from '../types';
import { getEventPOIs, getEventData } from '../services/EventService';
import FeedbackModal from '../components/feedback/FeedbackModal';
import FeedbackService from '../services/FeedbackService';

const { width: screenWidth } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<POI | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [currentEventId] = useState('1'); // Default event for MVP

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventPOIs, fullEventData] = await Promise.all([
        getEventPOIs(currentEventId),
        getEventData(currentEventId).catch(() => null) // Graceful fallback
      ]);
      setPois(eventPOIs);
      setEventData(fullEventData);
    } catch (error) {
      console.error('Failed to load event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPOIIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee size={20} color="#FF9500" />;
      case 'social':
        return <Users size={20} color="#34C759" />;
      case 'service':
        return <AlertCircle size={20} color="#007AFF" />;
      default:
        return <MapPin size={20} color="#8E8E93" />;
    }
  };

  const getPOIColor = (type: string) => {
    switch (type) {
      case 'food':
        return '#FF9500';
      case 'social':
        return '#34C759';
      case 'service':
        return '#007AFF';
      case 'venue':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  const handleNavigation = (poi: POI) => {
    // Show navigation instructions instead of AR
    Alert.alert(
      'Navigate to ' + poi.name,
      `Directions: Head to coordinates (${poi.x}, ${poi.y}) on the venue map.\n\nThis location is marked as a ${poi.type} area.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Got it', style: 'default' }
      ]
    );
  };

  const handleFeedback = (poi: POI) => {
    setFeedbackTarget(poi);
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    try {
      await FeedbackService.submitFeedback(feedback);
      setShowFeedback(false);
      setFeedbackTarget(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const renderPOI = (poi: POI) => {
    const isSelected = selectedPOI?.id === poi.id;
    return (
      <TouchableOpacity
        key={poi.id}
        style={[
          styles.poiMarker,
          {
            left: poi.x,
            top: poi.y,
            backgroundColor: getPOIColor(poi.type),
            transform: isSelected ? [{ scale: 1.2 }] : [{ scale: 1 }],
          },
        ]}
        onPress={() => setSelectedPOI(poi)}
      >
        <Text style={styles.poiText}>{poi.name.charAt(0)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Interactive Map</Text>
        <Text style={styles.subtitle}>Navigate the venue</Text>
      </View>

      <View style={styles.mapContainer}>
        {/* Simulated floor plan */}
        <View style={styles.floorPlan}>
          {pois.map(renderPOI)}
          
          {/* Floor plan grid lines */}
          <View style={styles.gridLines}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.gridLine,
                  {
                    left: (i * screenWidth) / 10,
                    height: '100%',
                    width: 1,
                  },
                ]}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.gridLine,
                  {
                    top: (i * 300) / 8,
                    width: '100%',
                    height: 1,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* POI Details Panel */}
      {selectedPOI && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsTitle}>
              {getPOIIcon(selectedPOI.type)}
              <Text style={styles.detailsName}>{selectedPOI.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPOI(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.detailsDescription}>
            {selectedPOI.description || 'No description available'}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigation(selectedPOI)}
            >
              <Route size={16} color="#fff" />
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => handleFeedback(selectedPOI)}
            >
              <MessageSquare size={16} color="#007AFF" />
              <Text style={styles.feedbackButtonText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* POI Legend */}
      <ScrollView
        horizontal
        style={styles.legend}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.legendItem}>
          <Coffee size={16} color="#FF9500" />
          <Text style={styles.legendText}>Food</Text>
        </View>
        <View style={styles.legendItem}>
          <Users size={16} color="#34C759" />
          <Text style={styles.legendText}>Social</Text>
        </View>
        <View style={styles.legendItem}>
          <AlertCircle size={16} color="#007AFF" />
          <Text style={styles.legendText}>Service</Text>
        </View>
        <View style={styles.legendItem}>
          <MapPin size={16} color="#AF52DE" />
          <Text style={styles.legendText}>Venue</Text>
        </View>
      </ScrollView>

      {/* Navigation info is now handled via alert dialog */}

      {/* Feedback Modal */}
      {feedbackTarget && (
        <FeedbackModal
          visible={showFeedback}
          onClose={() => {
            setShowFeedback(false);
            setFeedbackTarget(null);
          }}
          onSubmit={handleFeedbackSubmit}
          targetType="poi"
          targetId={feedbackTarget.id}
          targetName={feedbackTarget.name}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floorPlan: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#e0e0e0',
  },
  poiMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  poiText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsPanel: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailsName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  detailsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  navigateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  feedbackButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MapScreen;