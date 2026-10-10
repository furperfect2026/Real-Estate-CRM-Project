import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PIPELINE_STAGES, MOCK_LEADS, MobileLead } from '../../data/mock-crm-data';

export default function PipelineScreen() {
  const router = useRouter();
  const [selectedStageId, setSelectedStageId] = useState('new');
  const [leadsState, setLeadsState] = useState<MobileLead[]>(MOCK_LEADS);

  const selectedStage = PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];
  const stageLeads = leadsState.filter((l) => l.status === selectedStageId);

  const handleAdvanceStage = (leadId: string) => {
    const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === selectedStageId);
    if (currentIndex < PIPELINE_STAGES.length - 2) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1];
      setLeadsState((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: nextStage.id as any, stage_label: nextStage.label }
            : l
        )
      );
      Alert.alert('Pipeline Updated', `Lead moved to ${nextStage.label}!`);
    }
  };

  const handleCall = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone', `Calling ${name}`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.title}>Sales Pipeline</Text>
            <Text style={styles.subTitle}>7-Stage Deal Flow Tracker</Text>
          </View>
          <View style={styles.pipelineTotalBadge}>
            <Text style={styles.pipelineTotalText}>Total: ₹69.9 Cr</Text>
          </View>
        </View>

        {/* Horizontal Stage Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageTabsScroll}>
          {PIPELINE_STAGES.map((st) => (
            <TouchableOpacity
              key={st.id}
              style={[
                styles.stageTab,
                selectedStageId === st.id && {
                  backgroundColor: st.color,
                  borderColor: st.color,
                },
              ]}
              onPress={() => setSelectedStageId(st.id)}
            >
              <Text
                style={[
                  styles.stageTabText,
                  selectedStageId === st.id && { color: '#ffffff', fontWeight: '800' },
                ]}
              >
                {st.label} ({st.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Stage Summary Banner */}
      <View style={[styles.stageBanner, { borderLeftColor: selectedStage.color }]}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.bannerStageName}>{selectedStage.label}</Text>
            <Text style={styles.bannerVolume}>{selectedStage.value} in Stage Pipeline</Text>
          </View>
          <View style={[styles.bannerCountPill, { backgroundColor: selectedStage.color }]}>
            <Text style={styles.bannerCountText}>{selectedStage.count} Leads</Text>
          </View>
        </View>
      </View>

      {/* Leads inside this stage */}
      <ScrollView contentContainerStyle={styles.leadListContainer}>
        {stageLeads.length > 0 ? (
          stageLeads.map((lead) => (
            <View key={lead.id} style={styles.pipelineLeadCard}>
              <View style={styles.rowBetween}>
                <View style={styles.rowAlign}>
                  <View style={styles.avatarPill}>
                    <Text style={styles.avatarPillText}>{lead.name[0]}</Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.leadCardName}>{lead.name}</Text>
                    <Text style={styles.leadCardPhone}>{lead.phone}</Text>
                  </View>
                </View>
                <View style={styles.scoreTag}>
                  <Text style={styles.scoreTagText}>🔥 {lead.score}</Text>
                </View>
              </View>

              <View style={styles.leadReqRow}>
                <Text style={styles.reqText}>📍 {lead.property_type}</Text>
                <Text style={styles.budgetText}>💰 {lead.budget}</Text>
              </View>

              {lead.notes ? (
                <Text style={styles.leadNotesText} numberOfLines={2}>
                  📝 {lead.notes}
                </Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.cardActionRow}>
                <TouchableOpacity
                  style={styles.cardCallBtn}
                  onPress={() => handleCall(lead.phone, lead.name)}
                >
                  <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.cardCallBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.advanceBtn}
                  onPress={() => handleAdvanceStage(lead.id)}
                >
                  <Text style={styles.advanceBtnText}>Advance Stage →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push(`/lead/${lead.id}`)}
                >
                  <Ionicons name="eye" size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={44} color="#334155" />
            <Text style={styles.emptyTitle}>Stage Active ({selectedStage.count} deals registered)</Text>
            <Text style={styles.emptySub}>
              Showing sample leads for demonstration. Tap on other stages (e.g. New Lead, Contacted, Site Visit) to view prospects.
            </Text>
          </View>
        )}

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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
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
  pipelineTotalBadge: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pipelineTotalText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 12,
  },
  stageTabsScroll: {
    flexDirection: 'row',
    marginTop: 12,
  },
  stageTab: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stageTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stageBanner: {
    backgroundColor: '#111827',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderLeftWidth: 4,
  },
  bannerStageName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  bannerVolume: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  bannerCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bannerCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  leadListContainer: {
    padding: 16,
    paddingTop: 8,
  },
  pipelineLeadCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  avatarPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  avatarPillText: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: 14,
  },
  leadCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  leadCardPhone: {
    fontSize: 11,
    color: '#9ca3af',
  },
  scoreTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreTagText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
  },
  leadReqRow: {
    marginVertical: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    gap: 4,
  },
  reqText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  budgetText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  leadNotesText: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cardCallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  advanceBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  advanceBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
