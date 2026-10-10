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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MOCK_PROPERTIES, MOCK_LEADS, MobileProperty } from '../../data/mock-crm-data';
import { THEME } from '../../constants/Colors';

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
            <Text style={styles.subTitle}>5 Active Developer Townships</Text>
          </View>
          <View style={styles.inventoryBadge}>
            <Text style={styles.inventoryBadgeText}>RERA Approved</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, location, or builder..."
            placeholderTextColor="#94a3b8"
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
                    ? { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }
                    : { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    prop.status === 'Ready to Move' ? { color: '#059669' } : { color: '#2563eb' },
                  ]}
                >
                  {prop.status}
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#d97706" style={{ marginRight: 4 }} />
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
              <Ionicons name="sparkles" size={15} color="#ffffff" style={{ marginRight: 6 }} />
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
                  <Ionicons name="close" size={20} color="#0f172a" />
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  inventoryBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inventoryBadgeText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 11,
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
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
  },
  propCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  propBuilder: {
    fontSize: 12,
    color: '#64748b',
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
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#334155',
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  priceLbl: {
    fontSize: 10,
    color: '#64748b',
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  reraLbl: {
    fontSize: 10,
    color: '#64748b',
  },
  reraVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  matchBtn: {
    flexDirection: 'row',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginVertical: 12,
  },
  matchedLeadItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  matchedLeadName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  matchedLeadPhone: {
    fontSize: 11,
    color: '#64748b',
  },
  matchedScoreTag: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchedScoreText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  matchedLeadBudget: {
    fontSize: 11,
    color: '#334155',
    marginVertical: 6,
    fontWeight: '600',
  },
  matchedActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  matchedCallBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563eb',
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
