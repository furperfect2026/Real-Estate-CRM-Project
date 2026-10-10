import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MOCK_PROPERTIES, MOCK_LEADS, MobileProperty } from '../../data/mock-crm-data';

export default function PropertiesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedProp, setSelectedProp] = useState<MobileProperty | null>(null);

  const filteredProperties = MOCK_PROPERTIES.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.builder.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.title}>Property Inventory</Text>
            <Text style={styles.subTitle}>5 Active Developer Projects</Text>
          </View>
          <View style={styles.inventoryBadge}>
            <Text style={styles.inventoryBadgeText}>RERA Approved</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, location, or builder..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredProperties.map((prop) => (
          <View key={prop.id} style={styles.propCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.propTitle}>{prop.title}</Text>
                <Text style={styles.propBuilder}>{prop.builder}</Text>
              </View>
              <View
                style={[
                  styles.statusTag,
                  prop.status === 'Ready to Move'
                    ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }
                    : { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6' },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    prop.status === 'Ready to Move' ? { color: '#10b981' } : { color: '#60a5fa' },
                  ]}
                >
                  {prop.status}
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>{prop.location}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLbl}>Configuration</Text>
                <Text style={styles.detailVal}>{prop.configuration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLbl}>Carpet Area</Text>
                <Text style={styles.detailVal}>{prop.carpet_area}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLbl}>Price Range</Text>
                <Text style={styles.priceVal}>{prop.price_range}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.reraLbl}>MahaRERA ID</Text>
                <Text style={styles.reraVal}>{prop.rera_id}</Text>
              </View>
            </View>

            {/* Smart Matching Action Button */}
            <TouchableOpacity
              style={styles.matchBtn}
              onPress={() => setSelectedProp(prop)}
            >
              <Ionicons name="sparkles" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.matchBtnText}>
                AI Match: {prop.matched_leads_count} Interested Leads Found
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* AI Smart Matchmaker Modal */}
      {selectedProp && (
        <Modal
          visible={!!selectedProp}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedProp(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Smart Lead Matchmaker</Text>
                  <Text style={styles.modalSub}>{selectedProp.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedProp(null)}
                >
                  <Ionicons name="close" size={20} color="#f8fafc" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionHeading}>
                Matching Inbound Leads ({selectedProp.matched_leads_count}):
              </Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {MOCK_LEADS.slice(0, selectedProp.matched_leads_count).map((lead) => (
                  <View key={lead.id} style={styles.matchedLeadItem}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.matchedLeadName}>{lead.name}</Text>
                        <Text style={styles.matchedLeadPhone}>{lead.phone}</Text>
                      </View>
                      <View style={styles.matchedScoreTag}>
                        <Text style={styles.matchedScoreText}>94% Match</Text>
                      </View>
                    </View>
                    <Text style={styles.matchedLeadBudget}>
                      Client Budget: {lead.budget}
                    </Text>

                    <View style={styles.matchedActionRow}>
                      <TouchableOpacity
                        style={styles.matchedCallBtn}
                        onPress={() => {
                          Linking.openURL(`tel:${lead.phone}`);
                        }}
                      >
                        <Ionicons name="call" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.matchedCallBtnText}>Call & Pitch</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.matchedWaBtn}
                        onPress={() => {
                          const text = encodeURIComponent(
                            `Hello ${lead.name}! Found a perfect match for you at ${selectedProp.title} (${selectedProp.configuration}) in ${selectedProp.price_range}. Sharing brochure!`
                          );
                          Linking.openURL(`whatsapp://send?phone=${lead.phone}&text=${text}`);
                        }}
                      >
                        <Ionicons name="logo-whatsapp" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.matchedWaBtnText}>Send Brochure</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subTitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  inventoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inventoryBadgeText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 11,
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
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
  },
  propCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  propBuilder: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  detailItem: {
    flex: 1,
  },
  detailLbl: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  priceLbl: {
    fontSize: 10,
    color: '#64748b',
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 2,
  },
  reraLbl: {
    fontSize: 10,
    color: '#64748b',
  },
  reraVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 2,
  },
  matchBtn: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  modalSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginVertical: 12,
  },
  matchedLeadItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
  },
  matchedLeadName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  matchedLeadPhone: {
    fontSize: 11,
    color: '#94a3b8',
  },
  matchedScoreTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchedScoreText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  matchedLeadBudget: {
    fontSize: 11,
    color: '#cbd5e1',
    marginVertical: 6,
  },
  matchedActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  matchedCallBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedCallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  matchedWaBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedWaBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
