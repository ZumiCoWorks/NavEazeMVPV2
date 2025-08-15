// src/screens/BuddiesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Users, Mail, Check, X } from 'lucide-react-native';
import { Buddy } from '../types';
import { getBuddies, addBuddyByEmail, updateBuddyStatus } from '../services/EventService';

const BuddiesScreen: React.FC = () => {
  const [friends, setFriends] = useState<Buddy[]>([]);
  const [requests, setRequests] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBuddyEmail, setNewBuddyEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    loadBuddies();
  }, []);

  const loadBuddies = async () => {
    try {
      const { friends: friendsData, requests: requestsData } = await getBuddies();
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading buddies:', error);
      // For MVP, show empty state
      setFriends([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuddy = async () => {
    if (!newBuddyEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await addBuddyByEmail(newBuddyEmail.trim());
      Alert.alert('Success', 'Buddy request sent!');
      setNewBuddyEmail('');
      setShowAddModal(false);
      loadBuddies();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send buddy request');
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await updateBuddyStatus(requestId, status);
      loadBuddies();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update request');
    }
  };

  const renderFriend = ({ item }: { item: Buddy }) => (
    <View style={styles.buddyCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.profiles?.email?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>
          {item.profiles?.name || item.profiles?.email || 'Unknown User'}
        </Text>
        <Text style={styles.buddyEmail}>{item.profiles?.email}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Connected</Text>
      </View>
    </View>
  );

  const renderRequest = ({ item }: { item: Buddy }) => (
    <View style={styles.buddyCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.profiles?.email?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>
          {item.profiles?.name || item.profiles?.email || 'Unknown User'}
        </Text>
        <Text style={styles.buddyEmail}>{item.profiles?.email}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRequestResponse(item.id, 'accepted')}
        >
          <Check size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleRequestResponse(item.id, 'declined')}
        >
          <X size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = ({ type }: { type: 'friends' | 'requests' }) => (
    <View style={styles.emptyState}>
      <Users size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {type === 'friends' ? 'No Friends Yet' : 'No Pending Requests'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === 'friends'
          ? 'Add friends to connect and share your location during events'
          : 'No pending buddy requests at the moment'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buddies</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({requests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'friends' ? (
          friends.length > 0 ? (
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState type="friends" />
          )
        ) : (
          requests.length > 0 ? (
            <FlatList
              data={requests}
              renderItem={renderRequest}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState type="requests" />
          )
        )}
      </View>

      {/* Add Buddy Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Buddy</Text>
            <TouchableOpacity onPress={handleAddBuddy}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#666" />
              <TextInput
                style={styles.emailInput}
                placeholder="Enter email address"
                value={newBuddyEmail}
                onChangeText={setNewBuddyEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.inputHint}>
              Send a buddy request to connect with friends during events
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buddyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  buddyEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sendText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
});

export default BuddiesScreen;