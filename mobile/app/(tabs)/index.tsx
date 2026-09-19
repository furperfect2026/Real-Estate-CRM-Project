import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { useLeads } from '../../hooks/use-leads';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: leads, isLoading } = useLeads();
  const router = useRouter();

  const newLeadsCount = leads?.filter(l => l.status === 'new').length || 0;
  const contactedLeadsCount = leads?.filter(l => l.status === 'contacted').length || 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name}>{user?.email?.split('@')[0] || 'Agent'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{newLeadsCount}</Text>
          <Text style={styles.statLabel}>New Leads</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{contactedLeadsCount}</Text>
          <Text style={styles.statLabel}>Contacted</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        
        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : leads && leads.length > 0 ? (
          leads.slice(0, 3).map(lead => (
            <TouchableOpacity 
              key={lead.id} 
              style={styles.activityCard}
              onPress={() => router.push(`/lead/${lead.id}`)}
            >
              <View>
                <Text style={styles.activityName}>{lead.name}</Text>
                <Text style={styles.activityStatus}>Status: {lead.status}</Text>
              </View>
              <Text style={styles.activityTime}>
                {new Date(lead.created_at || Date.now()).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#1e293b', // slate-800
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8', // slate-400
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc', // slate-50
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6', // blue-500
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 14,
    color: '#94a3b8',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
