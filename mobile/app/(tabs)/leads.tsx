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
import { THEME } from '../../constants/Colors';

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
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Inbound Leads CRM</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredLeads.length} Leads Active</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or BHK..."
            placeholderTextColor="#94a3b8"
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
              🔥 Hot Leads (90+)
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
                        ? { backgroundColor: '#fef2f2', borderColor: '#fecdd3' }
                        : { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreBadgeText,
                        lead.score >= 90 ? { color: '#e11d48' } : { color: '#2563eb' },
                      ]}
                    >
                      {lead.score >= 90 ? '🔥' : '⚡'} Score {lead.score}
                    </Text>
                  </View>
                </View>
                <Text style={styles.leadPhone}>{lead.phone}</Text>
              </View>
            </View>

            {/* Requirement Box */}
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

            {/* Site visit highlight */}
            {lead.site_visit_date ? (
              <View style={styles.siteVisitHighlight}>
                <Ionicons name="car" size={14} color="#d97706" style={{ marginRight: 6 }} />
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
                <Ionicons name="call" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.callActionBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.waActionBtn}
                onPress={() => handleWhatsApp(lead.phone, lead.name, lead.property_type)}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.waActionBtnText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailActionBtn}
                onPress={() => router.push(`/lead/${lead.id}`)}
              >
                <Ionicons name="eye-outline" size={15} color="#334155" style={{ marginRight: 6 }} />
                <Text style={styles.detailActionBtnText}>360° Profile</Text>
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
    backgroundColor: '#f8fafc', // crisp off-white
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  listContainer: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  leadAvatarInitials: {
    color: '#2563eb',
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
    color: '#0f172a',
  },
  leadPhone: {
    fontSize: 12,
    color: '#64748b',
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
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  reqLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  reqValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  reqBudgetValue: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '800',
  },
  sourceTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceTagText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '700',
  },
  siteVisitHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 8,
  },
  siteVisitText: {
    fontSize: 11,
    color: '#b45309',
  },
  leadNotes: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  callActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563eb',
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
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailActionBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
});
