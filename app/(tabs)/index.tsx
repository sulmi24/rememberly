import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotesStore } from '@/lib/store';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Brain, Plus, FileText, Link2, Image, LogOut, Wifi, WifiOff } from 'lucide-react-native';
import { NoteCard } from '@/components/NoteCard';

export default function HomeScreen() {
  const { notes, loading, fetchNotes, error, isOffline } = useNotesStore();
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    checkAuth();
    fetchNotes();
  }, []);

  async function checkAuth() {
    try {
      const { user, error } = await getCurrentUser();
      if (error) {
        setAuthError(error.message);
        return;
      }
      
      if (!user) {
        router.replace('/auth/login');
      } else {
        if (isMounted.current) {
          setUser(user);
          setAuthError(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthError('Failed to check authentication status');
    }
  }

  async function handleRefresh() {
    if (isMounted.current) {
      setRefreshing(true);
    }
    await fetchNotes();
    if (isMounted.current) {
      setRefreshing(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  const recentNotes = notes.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
            </View>
            <View style={styles.headerActions}>
              {isOffline && (
                <View style={styles.offlineIndicator}>
                  <WifiOff size={16} color="#DC2626" strokeWidth={2} />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <LogOut size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Authentication: {authError}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Capture</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#EFF6FF' }]}
              onPress={() => router.push('/(tabs)/create')}
            >
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                style={styles.actionIcon}
              >
                <FileText size={24} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Text Note</Text>
              <Text style={styles.actionSubtitle}>Quick thoughts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#F0FDF4' }]}
              onPress={() => router.push('/(tabs)/create')}
            >
              <LinearGradient
                colors={['#059669', '#10B981']}
                style={styles.actionIcon}
              >
                <Link2 size={24} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Save URL</Text>
              <Text style={styles.actionSubtitle}>Web articles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#FEF3C7' }]}
              onPress={() => router.push('/(tabs)/create')}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={styles.actionIcon}
              >
                <Image size={24} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Upload File</Text>
              <Text style={styles.actionSubtitle}>Images & docs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {isOffline && (
                <Text style={styles.errorSubtext}>
                  You're currently offline. Some features may not be available.
                </Text>
              )}
            </View>
          )}

          {recentNotes.length > 0 ? (
            <View style={styles.notesContainer}>
              {recentNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Brain size={48} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.emptyTitle}>
                {isOffline ? 'No cached notes available' : 'No notes yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isOffline 
                  ? 'Connect to the internet to sync your notes'
                  : 'Create your first note to get started with Rememberly'
                }
              </Text>
              {!isOffline && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Plus size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.createButtonText}>Create Note</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  signOutButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  notesContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
});