import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLeads } from '../../hooks/use-leads';

export default function LeadsScreen() {
  const { data: leads, isLoading, error } = useLeads();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load leads</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.leadCard}
      onPress={() => router.push(`/lead/${item.id}`)}
    >
      <View style={styles.leadHeader}>
        <Text style={styles.leadName}>{item.name}</Text>
        <View style={[
          styles.statusBadge, 
          item.status === 'new' ? styles.statusNew : 
          item.status === 'contacted' ? styles.statusContacted : 
          item.status === 'qualified' ? styles.statusQualified : styles.statusLost
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.leadEmail}>{item.email}</Text>
      <Text style={styles.leadPhone}>{item.phone}</Text>
      {item.property_type && (
        <Text style={styles.leadDetail}>Interested in: {item.property_type}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leads found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: '#1e293b', // slate-800
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusNew: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue
  },
  statusContacted: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber
  },
  statusQualified: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // emerald
  },
  statusLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // red
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    textTransform: 'capitalize',
  },
  leadEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  leadDetail: {
    fontSize: 14,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
