import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLeads, MobileLead } from '../../hooks/use-leads';

export default function LeadsScreen() {
  const router = useRouter();
  const { data: leads = [] } = useLeads();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'hot' | 'site_visit' | 'negotiation' | 'booking'>('all');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.property_type.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'hot') return lead.score >= 90;
    if (filter === 'site_visit') return lead.status === 'site_visit';
    if (filter === 'negotiation') return lead.status === 'negotiation';
    if (filter === 'booking') return lead.status === 'booking_done';
    return true;
  });

  const handleCall = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone Dialer', `Calling ${name} at ${phone}`);
    });
  };

  const handleWhatsApp = (phone: string, name: string, property: string) => {
    const text = encodeURIComponent(
      `Hello ${name}, greetings from Tathastu Infra! Sharing details and pricing for ${property}. Are you available for a quick discussion?`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp for ${name}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Search & Header Bar */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Inbound Leads CRM</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredLeads.length} Leads</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or BHK..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
              All ({leads.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'hot' && styles.filterPillActive]}
            onPress={() => setFilter('hot')}
          >
            <Text style={[styles.filterPillText, filter === 'hot' && styles.filterPillTextActive]}>
              🔥 Hot Leads (Score 90+)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'site_visit' && styles.filterPillActive]}
            onPress={() => setFilter('site_visit')}
          >
            <Text style={[styles.filterPillText, filter === 'site_visit' && styles.filterPillTextActive]}>
              🚗 Site Visits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'negotiation' && styles.filterPillActive]}
            onPress={() => setFilter('negotiation')}
          >
            <Text style={[styles.filterPillText, filter === 'negotiation' && styles.filterPillTextActive]}>
              💬 Negotiation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'booking' && styles.filterPillActive]}
            onPress={() => setFilter('booking')}
          >
            <Text style={[styles.filterPillText, filter === 'booking' && styles.filterPillTextActive]}>
              ✅ Booked
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Leads List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredLeads.map((lead) => (
          <View key={lead.id} style={styles.leadCard}>
            {/* Top row */}
            <View style={styles.leadHeaderRow}>
              <View style={styles.leadAvatarCircle}>
                <Text style={styles.leadAvatarInitials}>
                  {lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <View
                    style={[
                      styles.scoreBadge,
                      lead.score >= 90
                        ? { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }
                        : { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreBadgeText,
                        lead.score >= 90 ? { color: '#f87171' } : { color: '#60a5fa' },
                      ]}
                    >
                      {lead.score >= 90 ? '🔥' : '⚡'} Score {lead.score}
                    </Text>
                  </View>
                </View>
                <Text style={styles.leadPhone}>{lead.phone}</Text>
              </View>
            </View>

            {/* Requirement & Budget Box */}
            <View style={styles.requirementBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.reqLabel}>Requirement:</Text>
                <Text style={styles.reqValue}>{lead.property_type}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.reqLabel}>Budget Range:</Text>
                <Text style={styles.reqBudgetValue}>{lead.budget}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.reqLabel}>Source Portal:</Text>
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceTagText}>{lead.source}</Text>
                </View>
              </View>
            </View>

            {/* Site visit or notes highlight */}
            {lead.site_visit_date ? (
              <View style={styles.siteVisitHighlight}>
                <Ionicons name="car" size={14} color="#f59e0b" style={{ marginRight: 6 }} />
                <Text style={styles.siteVisitText}>
                  Site Tour Scheduled: <Text style={{ fontWeight: 'bold' }}>{lead.site_visit_date}</Text>
                </Text>
              </View>
            ) : null}

            {lead.notes ? (
              <Text style={styles.leadNotes} numberOfLines={2}>
                📝 {lead.notes}
              </Text>
            ) : null}

            {/* Action Buttons Row */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.callActionBtn}
                onPress={() => handleCall(lead.phone, lead.name)}
              >
                <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.callActionBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.waActionBtn}
                onPress={() => handleWhatsApp(lead.phone, lead.name, lead.property_type)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.waActionBtnText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => router.push(`/lead/${lead.id}`)}
              >
                <Ionicons name="eye-outline" size={16} color="#cbd5e1" style={{ marginRight: 6 }} />
                <Text style={styles.detailActionBtnText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  countBadge: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  leadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leadAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  leadAvatarInitials: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  leadPhone: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  scoreBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  requirementBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  reqLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  reqValue: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '600',
  },
  reqBudgetValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  sourceTag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceTagText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  siteVisitHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 8,
  },
  siteVisitText: {
    fontSize: 11,
    color: '#fbbf24',
  },
  leadNotes: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 10,
  },
  callActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  waActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailActionBtn: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailActionBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
});
