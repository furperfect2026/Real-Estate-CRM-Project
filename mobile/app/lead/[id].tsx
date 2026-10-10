import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLead, useUpdateLead } from '../../hooks/use-leads';
import { MOCK_PROPERTIES } from '../../data/mock-crm-data';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lead } = useLead(id as string);
  const updateLead = useUpdateLead();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState('01:42');
  const [managerNotes, setManagerNotes] = useState(lead?.notes || '');
  const [showTranscript, setShowTranscript] = useState(true);

  if (!lead) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Lead not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${lead.phone}`).catch(() => {
      Alert.alert('Phone', `Calling ${lead.name} at ${lead.phone}`);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${lead.name}! Following up regarding your inquiry for ${lead.property_type}. Sharing site tour schedule and brochure.`
    );
    Linking.openURL(`whatsapp://send?phone=${lead.phone}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp for ${lead.name}`);
    });
  };

  const handleSaveNotes = () => {
    updateLead.mutate({ id: lead.id, data: { notes: managerNotes } });
    Alert.alert('Saved', 'Confidential manager notes updated.');
  };

  const togglePlayAudio = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setPlaybackTime('02:15');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Lead 360° Profile</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scorePillText}>🔥 {lead.score}</Text>
        </View>
      </View>

      {/* Main Client Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{lead.name}</Text>
            <Text style={styles.clientPhone}>{lead.phone}</Text>
            <Text style={styles.clientEmail}>{lead.email}</Text>
          </View>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>{lead.stage_label}</Text>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Call Client</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.visitBtn}
            onPress={() => Alert.alert('Site Visit', `Site visit itinerary confirmed for ${lead.name}`)}
          >
            <Ionicons name="car" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: '#f59e0b' }]}>Site Tour</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Simulated Call Recording Player */}
      <View style={styles.audioPlayerCard}>
        <View style={styles.rowBetween}>
          <View style={styles.rowAlign}>
            <Ionicons name="mic-circle" size={22} color="#3b82f6" />
            <Text style={styles.audioTitle}>Recorded Call Audio (QA Audit)</Text>
          </View>
          <View style={styles.durationPill}>
            <Text style={styles.durationPillText}>{lead.call_duration || '04m 12s'}</Text>
          </View>
        </View>

        <View style={styles.audioControlRow}>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlayAudio}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.waveformWrap}>
            <View style={styles.waveformBars}>
              {[14, 28, 42, 20, 36, 18, 46, 32, 22, 40, 16, 30, 24, 38, 12, 34, 26, 44, 18, 30].map(
                (h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: h,
                        backgroundColor: i < 10 ? '#3b82f6' : '#334155',
                      },
                    ]}
                  />
                )
              )}
            </View>
            <Text style={styles.timerText}>
              {playbackTime} / {lead.call_duration || '04:12'}
            </Text>
          </View>
        </View>

        {/* Call Transcript Toggle */}
        <TouchableOpacity
          style={styles.transcriptToggleRow}
          onPress={() => setShowTranscript(!showTranscript)}
        >
          <Text style={styles.transcriptToggleText}>
            {showTranscript ? 'Hide Call Transcript ▲' : 'Show AI Call Transcript ▼'}
          </Text>
        </TouchableOpacity>

        {showTranscript && (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLine}>
              <Text style={{ fontWeight: 'bold', color: '#60a5fa' }}>Caller (Gayatri): </Text>
              "Good afternoon Mr. {lead.name.split(' ')[0]}, calling from Tathastu Infra regarding your inquiry for {lead.property_type}."
            </Text>
            <Text style={styles.transcriptLine}>
              <Text style={{ fontWeight: 'bold', color: '#34d399' }}>Client ({lead.name.split(' ')[0]}): </Text>
              "Yes, my budget is around {lead.budget}. Looking for 2 covered parkings and higher floor. Is a Sunday tour available?"
            </Text>
            <Text style={styles.transcriptLine}>
              <Text style={{ fontWeight: 'bold', color: '#60a5fa' }}>Caller (Gayatri): </Text>
              "Yes sir! We have a private cab pickup arranged for your family. Scheduled for Sunday 11:30 AM."
            </Text>
          </View>
        )}
      </View>

      {/* Requirement Details Grid */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Client Requirements & Source</Text>
        <View style={styles.reqGrid}>
          <View style={styles.reqItem}>
            <Text style={styles.reqLbl}>Budget Bracket</Text>
            <Text style={styles.reqValGreen}>{lead.budget}</Text>
          </View>
          <View style={styles.reqItem}>
            <Text style={styles.reqLbl}>Configuration</Text>
            <Text style={styles.reqVal}>{lead.property_type}</Text>
          </View>
          <View style={styles.reqItem}>
            <Text style={styles.reqLbl}>Inquiry Channel</Text>
            <Text style={styles.reqVal}>{lead.source}</Text>
          </View>
          <View style={styles.reqItem}>
            <Text style={styles.reqLbl}>Allotted Rep</Text>
            <Text style={styles.reqVal}>{lead.assigned_to}</Text>
          </View>
        </View>
      </View>

      {/* Lead Chronological Timeline */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Lead Journey & Activity Timeline</Text>
        <View style={styles.timelineList}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>Inbound Lead Auto-Ingested</Text>
              <Text style={styles.timelineSub}>Captured via {lead.source} webhook</Text>
              <Text style={styles.timelineTime}>Yesterday, 10:15 AM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>First Outreach Call (04m 12s)</Text>
              <Text style={styles.timelineSub}>
                Connected by {lead.assigned_to}. HDFC home loan pre-approved.
              </Text>
              <Text style={styles.timelineTime}>Yesterday, 11:00 AM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#8b5cf6' }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>WhatsApp Brochure & Video Sent</Text>
              <Text style={styles.timelineSub}>Pride World City brochure delivered</Text>
              <Text style={styles.timelineTime}>Yesterday, 02:30 PM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.timelineTitle}>Site Tour Scheduled</Text>
              <Text style={styles.timelineSub}>Cab booked for Charholi project inspection</Text>
              <Text style={styles.timelineTime}>Today, 11:30 AM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Confidential Manager Notes */}
      <View style={styles.sectionCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionHeading}>Confidential Manager Notes</Text>
          <TouchableOpacity onPress={handleSaveNotes}>
            <Text style={styles.saveNotesText}>Save Notes</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={3}
          value={managerNotes}
          onChangeText={setManagerNotes}
          placeholder="Enter confidential notes, negotiation terms, or loan requirements..."
          placeholderTextColor="#64748b"
        />
      </View>

      {/* Recommended Property Match */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>AI Recommended Property</Text>
        <View style={styles.matchCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.matchTitle}>{MOCK_PROPERTIES[0].title}</Text>
            <View style={styles.matchScoreTag}>
              <Text style={styles.matchScoreTagText}>96% Match</Text>
            </View>
          </View>
          <Text style={styles.matchLoc}>{MOCK_PROPERTIES[0].location}</Text>
          <Text style={styles.matchPrice}>{MOCK_PROPERTIES[0].price_range}</Text>
          <TouchableOpacity
            style={styles.quoteBtn}
            onPress={() => {
              const text = encodeURIComponent(
                `Hello ${lead.name}! Recommending ${MOCK_PROPERTIES[0].title} in ${MOCK_PROPERTIES[0].price_range}. Sharing all details now.`
              );
              Linking.openURL(`whatsapp://send?phone=${lead.phone}&text=${text}`);
            }}
          >
            <Ionicons name="share-social-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.quoteBtnText}>Pitch This Unit Over WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#f8fafc',
    fontSize: 13,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f8fafc',
  },
  scorePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  scorePillText: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 11,
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  clientPhone: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  stageBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stageBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 10,
    paddingVertical: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  audioPlayerCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  durationPill: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationPillText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  audioControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformWrap: {
    flex: 1,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    marginBottom: 4,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  transcriptToggleRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  transcriptToggleText: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: '600',
  },
  transcriptBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  transcriptLine: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },
  reqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  reqItem: {
    width: '46%',
  },
  reqLbl: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  reqVal: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 2,
  },
  reqValGreen: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '800',
    marginTop: 2,
  },
  timelineList: {
    gap: 14,
    borderLeftWidth: 2,
    borderLeftColor: '#1e293b',
    marginLeft: 8,
    paddingLeft: 12,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -19,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  timelineSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  timelineTime: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  saveNotesText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#f8fafc',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  matchCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  matchScoreTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  matchScoreTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  matchLoc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  matchPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 4,
  },
  quoteBtn: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  quoteBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
