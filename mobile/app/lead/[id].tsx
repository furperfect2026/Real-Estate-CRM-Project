import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLead, useUpdateLead } from '../../hooks/use-leads';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lead, isLoading, error } = useLead(id as string);
  const updateLead = useUpdateLead();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !lead) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load lead details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${lead.phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${lead.phone}`);
  };

  const handleStatusChange = (newStatus: 'new' | 'contacted' | 'qualified' | 'lost') => {
    updateLead.mutate({ id: lead.id, data: { status: newStatus } });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{lead.name}</Text>
        <View style={[
          styles.statusBadge, 
          lead.status === 'new' ? styles.statusNew : 
          lead.status === 'contacted' ? styles.statusContacted : 
          lead.status === 'qualified' ? styles.statusQualified : styles.statusLost
        ]}>
          <Text style={styles.statusText}>{lead.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{lead.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{lead.phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lead Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Budget</Text>
          <Text style={styles.infoValue}>{lead.budget || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Property Type</Text>
          <Text style={styles.infoValue}>{lead.property_type || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Source</Text>
          <Text style={styles.infoValue}>{lead.source || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(lead.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
          <Text style={styles.actionButtonText}>📞 Call Lead</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={handleWhatsApp}>
          <Text style={styles.actionButtonText}>💬 WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtonsRow}>
          {['new', 'contacted', 'qualified', 'lost'].map((status) => (
            <TouchableOpacity 
              key={status}
              style={[
                styles.statusUpdateButton,
                lead.status === status && styles.statusUpdateActive
              ]}
              onPress={() => handleStatusChange(status as any)}
              disabled={updateLead.isPending}
            >
              <Text style={[
                styles.statusUpdateText,
                lead.status === status && styles.statusUpdateTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
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
  header: {
    padding: 24,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusNew: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  statusContacted: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  statusQualified: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  statusLost: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#cbd5e1',
    textTransform: 'capitalize',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 24,
    gap: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#3b82f6', // blue-500
  },
  whatsappButton: {
    backgroundColor: '#10b981', // emerald-500
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusUpdateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'transparent',
  },
  statusUpdateActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusUpdateText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  statusUpdateTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#f8fafc',
  },
});
