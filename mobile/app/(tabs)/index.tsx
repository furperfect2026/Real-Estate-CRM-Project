import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/use-auth';
import {
  MOCK_LEADS,
  PIPELINE_STAGES,
  TEAM_LEADERBOARD,
} from '../../data/mock-crm-data';

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, isAdmin, isManager, isEmployee, switchPersona, personas } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showDialerModal, setShowDialerModal] = useState(false);

  const periods = [
    { id: '7d' as const, label: '7 Days' },
    { id: '30d' as const, label: '30 Days' },
    { id: '90d' as const, label: 'Quarter' },
    { id: '1y' as const, label: 'Year' },
  ];

  const kpiData = {
    '7d': { pipeline: '₹4.8 Cr', leads: '64', visits: '14', closed: '₹1.2 Cr' },
    '30d': { pipeline: '₹18.4 Cr', leads: '342', visits: '48', closed: '₹4.2 Cr' },
    '90d': { pipeline: '₹48.6 Cr', leads: '980', visits: '142', closed: '₹12.8 Cr' },
    '1y': { pipeline: '₹142.0 Cr', leads: '3,450', visits: '520', closed: '₹38.5 Cr' },
  }[period];

  const handleDialLead = (phone: string, name: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Dialer', `Calling ${name} at ${phone}`);
    });
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(
      `Hello ${name}, greetings from Tathastu Infra! Sharing the brochure and site visit details.`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp for ${name}`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Brand & Status Bar */}
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="business" size={18} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Tathastu Infra</Text>
            <Text style={styles.brandSubtitle}>Sales ERP & CRM</Text>
          </View>
        </View>
        <View style={styles.liveSyncBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveSyncText}>Live Sync</Text>
        </View>
      </View>

      {/* Persona Switcher Bar */}
      <View style={styles.personaCard}>
        <View style={styles.personaTopRow}>
          <View style={[styles.avatarCircle, { backgroundColor: currentUser.badge_color }]}>
            <Text style={styles.avatarText}>{currentUser.avatar}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.rowAlign}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={[styles.roleBadge, { borderColor: currentUser.badge_color }]}>
                <Text style={[styles.roleBadgeText, { color: currentUser.badge_color }]}>
                  {isAdmin ? 'ADMIN' : isManager ? 'MANAGER' : 'CALLER'}
                </Text>
              </View>
            </View>
            <Text style={styles.userRoleTitle}>{currentUser.role_title}</Text>
          </View>
        </View>

        {/* Switch Persona Buttons */}
        <View style={styles.switchPersonaRow}>
          <Text style={styles.switchLabel}>Switch View:</Text>
          {personas.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.personaBtn,
                currentUser.id === p.id && { backgroundColor: p.badge_color, borderColor: p.badge_color },
              ]}
              onPress={() => switchPersona(p.id)}
            >
              <Text
                style={[
                  styles.personaBtnText,
                  currentUser.id === p.id && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                {p.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Period Filter Tabs */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.periodTab, period === p.id && styles.periodTabActive]}
            onPress={() => setPeriod(p.id)}
          >
            <Text style={[styles.periodTabText, period === p.id && styles.periodTabTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary 4 KPI Cards */}
      <View style={styles.kpiGrid}>
        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: 'rgba(59, 130, 246, 0.4)' }]}
          onPress={() => router.push('/pipeline')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Pipeline Value' : isManager ? 'Team Pipeline' : 'Calling Queue'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="trending-up" size={16} color="#3b82f6" />
            </View>
          </View>
          <Text style={styles.kpiValue}>
            {isAdmin ? kpiData.pipeline : isManager ? '₹9.8 Cr' : '18 Leads'}
          </Text>
          <View style={styles.kpiFooter}>
            <Text style={styles.trendUpText}>↑ +18.4% MoM</Text>
            <Text style={styles.kpiSub}>Across 4 projects</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}
          onPress={() => router.push('/leads')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Inbound Leads' : isManager ? 'Team Inflow' : 'Calls Today'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="people" size={16} color="#10b981" />
            </View>
          </View>
          <Text style={styles.kpiValue}>
            {isAdmin ? kpiData.leads : isManager ? '186 Leads' : '14 Calls'}
          </Text>
          <View style={styles.kpiFooter}>
            <Text style={styles.trendUpText}>↑ +24.2% MoM</Text>
            <Text style={styles.kpiSub}>Meta & 99acres</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: 'rgba(245, 158, 11, 0.4)' }]}
          onPress={() => router.push('/leads')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Site Visits' : isManager ? 'Team Visits' : 'My Visits'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="calendar" size={16} color="#f59e0b" />
            </View>
          </View>
          <Text style={styles.kpiValue}>
            {isAdmin ? kpiData.visits : isManager ? '28 Scheduled' : '4 Visits'}
          </Text>
          <View style={styles.kpiFooter}>
            <Text style={styles.trendUpText}>↑ +12.5% pace</Text>
            <Text style={styles.kpiSub}>8 scheduled today</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: 'rgba(168, 85, 247, 0.4)' }]}
          onPress={() => router.push('/pipeline')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Closed Bookings' : isManager ? 'Team Bookings' : 'My Bookings'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Ionicons name="trophy" size={16} color="#a855f7" />
            </View>
          </View>
          <Text style={styles.kpiValue}>
            {isAdmin ? kpiData.closed : isManager ? '₹2.4 Cr' : '₹1.15 Cr'}
          </Text>
          <View style={styles.kpiFooter}>
            <Text style={styles.trendUpText}>↑ +31.8% MoM</Text>
            <Text style={styles.kpiSub}>14 units sold</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Urgent Caller / Follow-up Alert Banner */}
      <View style={styles.urgentBanner}>
        <View style={styles.urgentIconCircle}>
          <Ionicons name="call" size={18} color="#ef4444" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.rowAlign}>
            <Text style={styles.urgentTitle}>⚠️ 2 Urgent Follow-Ups Due Today</Text>
            <View style={styles.urgentPill}>
              <Text style={styles.urgentPillText}>Immediate</Text>
            </View>
          </View>
          <Text style={styles.urgentDesc}>
            Missed follow-up for <Text style={{ fontWeight: 'bold', color: '#f8fafc' }}>Vikram Rao</Text> (Pride World City) + 1 site visit scheduled at 11:00 AM.
          </Text>
          <View style={styles.urgentBtnRow}>
            <TouchableOpacity
              style={styles.urgentCallBtn}
              onPress={() => handleDialLead('+91 98231 44521', 'Vikram Rao')}
            >
              <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.urgentCallBtnText}>Dial Vikram Rao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.urgentWaBtn}
              onPress={() => handleWhatsApp('+91 98231 44521', 'Vikram Rao')}
            >
              <Ionicons name="logo-whatsapp" size={14} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={styles.urgentWaBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Caller Performance Progress Bar (If in Caller mode or preview) */}
      <View style={styles.callerGoalCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.goalLabel}>DAILY CALLING GOAL</Text>
            <Text style={styles.goalCount}>14 / 25 Calls Completed (56%)</Text>
          </View>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>Target: 25</Text>
          </View>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: '56%' }]} />
        </View>
        <View style={styles.goalStatsRow}>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatNum}>02m 45s</Text>
            <Text style={styles.goalStatLbl}>Avg Duration</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatNum}>78.5%</Text>
            <Text style={styles.goalStatLbl}>Connected</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatNum}>4 Tours</Text>
            <Text style={styles.goalStatLbl}>Site Visits</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatNum}>12</Text>
            <Text style={styles.goalStatLbl}>AI Messages</Text>
          </View>
        </View>
      </View>

      {/* 7-Stage Pipeline Funnel Cards */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>7-Stage Sales Pipeline</Text>
        <TouchableOpacity onPress={() => router.push('/pipeline')}>
          <Text style={styles.sectionAction}>View Kanban →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
        {PIPELINE_STAGES.map((st) => (
          <TouchableOpacity
            key={st.id}
            style={[styles.stageCard, { borderTopColor: st.color }]}
            onPress={() => router.push('/pipeline')}
          >
            <Text style={styles.stageName}>{st.label}</Text>
            <Text style={[styles.stageCount, { color: st.color }]}>{st.count}</Text>
            <Text style={styles.stageValue}>{st.value}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => handleDialLead('+91 98231 44521', 'Active Queue')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Ionicons name="call" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.qaTitle}>Callen Dialer</Text>
          <Text style={styles.qaSubtitle}>Start Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/properties')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
            <Ionicons name="sparkles" size={20} color="#a855f7" />
          </View>
          <Text style={styles.qaTitle}>AI Matchmaker</Text>
          <Text style={styles.qaSubtitle}>Fit Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/leads')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="person-add" size={20} color="#10b981" />
          </View>
          <Text style={styles.qaTitle}>Add Lead</Text>
          <Text style={styles.qaSubtitle}>Direct Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/properties')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="business" size={20} color="#f59e0b" />
          </View>
          <Text style={styles.qaTitle}>Properties</Text>
          <Text style={styles.qaSubtitle}>5 Projects</Text>
        </TouchableOpacity>
      </View>

      {/* Lead Acquisition Channels */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Lead Inflow Channels</Text>
        <Text style={styles.cardHeaderSub}>Direct API webhooks & portal intake</Text>
        <View style={styles.sourceBarContainer}>
          <View style={styles.sourceItem}>
            <View style={styles.rowBetween}>
              <Text style={styles.sourceName}>Facebook Ads (Meta)</Text>
              <Text style={styles.sourceCount}>144 leads (42%)</Text>
            </View>
            <View style={styles.sourceTrack}>
              <View style={[styles.sourceFill, { width: '42%', backgroundColor: '#3b82f6' }]} />
            </View>
          </View>

          <View style={styles.sourceItem}>
            <View style={styles.rowBetween}>
              <Text style={styles.sourceName}>99acres Portal</Text>
              <Text style={styles.sourceCount}>96 leads (28%)</Text>
            </View>
            <View style={styles.sourceTrack}>
              <View style={[styles.sourceFill, { width: '28%', backgroundColor: '#10b981' }]} />
            </View>
          </View>

          <View style={styles.sourceItem}>
            <View style={styles.rowBetween}>
              <Text style={styles.sourceName}>MagicBricks</Text>
              <Text style={styles.sourceCount}>62 leads (18%)</Text>
            </View>
            <View style={styles.sourceTrack}>
              <View style={[styles.sourceFill, { width: '18%', backgroundColor: '#f59e0b' }]} />
            </View>
          </View>

          <View style={styles.sourceItem}>
            <View style={styles.rowBetween}>
              <Text style={styles.sourceName}>Housing.com & Website</Text>
              <Text style={styles.sourceCount}>40 leads (12%)</Text>
            </View>
            <View style={styles.sourceTrack}>
              <View style={[styles.sourceFill, { width: '12%', backgroundColor: '#a855f7' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Team Leaderboard */}
      <View style={styles.sectionCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardHeaderTitle}>Team Leaderboard</Text>
            <Text style={styles.cardHeaderSub}>Top revenue closers this month</Text>
          </View>
          <Ionicons name="ribbon" size={22} color="#f59e0b" />
        </View>

        <View style={styles.leaderboardList}>
          {TEAM_LEADERBOARD.map((tm) => (
            <View key={tm.rank} style={styles.leaderItem}>
              <View
                style={[
                  styles.rankCircle,
                  tm.rank === 1
                    ? { backgroundColor: '#f59e0b' }
                    : tm.rank === 2
                    ? { backgroundColor: '#94a3b8' }
                    : { backgroundColor: '#334155' },
                ]}
              >
                <Text style={styles.rankNum}>#{tm.rank}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.leaderName}>{tm.name}</Text>
                <Text style={styles.leaderRole}>{tm.role}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.leaderRevenue}>{tm.revenue}</Text>
                <Text style={styles.leaderDeals}>{tm.deals} Deals ({tm.conversion})</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Hot Leads Feed */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>High Priority Leads</Text>
        <TouchableOpacity onPress={() => router.push('/leads')}>
          <Text style={styles.sectionAction}>See All ({MOCK_LEADS.length}) →</Text>
        </TouchableOpacity>
      </View>

      {MOCK_LEADS.slice(0, 4).map((lead) => (
        <TouchableOpacity
          key={lead.id}
          style={styles.recentLeadCard}
          onPress={() => router.push(`/lead/${lead.id}`)}
        >
          <View style={styles.rowBetween}>
            <View style={styles.rowAlign}>
              <View style={styles.leadAvatarMini}>
                <Text style={styles.leadAvatarMiniText}>
                  {lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.leadCardName}>{lead.name}</Text>
                <Text style={styles.leadCardPhone}>{lead.phone}</Text>
              </View>
            </View>

            <View style={styles.scorePill}>
              <Text style={styles.scorePillText}>🔥 {lead.score}</Text>
            </View>
          </View>

          <View style={styles.leadCardBody}>
            <Text style={styles.leadPropType}>
              <Text style={{ color: '#94a3b8' }}>Req: </Text>
              {lead.property_type}
            </Text>
            <Text style={styles.leadBudget}>
              <Text style={{ color: '#94a3b8' }}>Budget: </Text>
              {lead.budget}
            </Text>
          </View>

          <View style={styles.leadCardFooter}>
            <View style={styles.stageTag}>
              <Text style={styles.stageTagText}>{lead.stage_label}</Text>
            </View>
            <View style={styles.quickLeadActionRow}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleDialLead(lead.phone, lead.name)}
              >
                <Ionicons name="call" size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleWhatsApp(lead.phone, lead.name)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => router.push(`/lead/${lead.id}`)}
              >
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16', // Ultra dark slate
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
  },
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveSyncText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  personaCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  personaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f8fafc',
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userRoleTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  switchPersonaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 10,
    gap: 8,
  },
  switchLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  personaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
  },
  personaBtnText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: '#3b82f6',
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  periodTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.3%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    flex: 1,
  },
  kpiIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 4,
  },
  kpiFooter: {
    flexDirection: 'column',
    gap: 2,
  },
  trendUpText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
  },
  kpiSub: {
    fontSize: 10,
    color: '#6b7280',
  },
  urgentBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    marginBottom: 14,
  },
  urgentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fca5a5',
  },
  urgentPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgentPillText: {
    color: '#fca5a5',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  urgentDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
    lineHeight: 16,
  },
  urgentBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  urgentCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentCallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  urgentWaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentWaBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  callerGoalCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
    letterSpacing: 0.5,
  },
  goalCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalPillText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  goalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 10,
  },
  goalStatItem: {
    alignItems: 'center',
  },
  goalStatNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  goalStatLbl: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  stageScroll: {
    marginBottom: 16,
  },
  stageCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    width: 120,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderTopWidth: 3,
  },
  stageName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  stageCount: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  stageValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionBtn: {
    width: '23%',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  qaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  qaTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
  },
  qaSubtitle: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 12,
  },
  sourceBarContainer: {
    gap: 10,
  },
  sourceItem: {
    gap: 4,
  },
  sourceName: {
    fontSize: 11,
    color: '#d1d5db',
    fontWeight: '600',
  },
  sourceCount: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '700',
  },
  sourceTrack: {
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sourceFill: {
    height: '100%',
    borderRadius: 3,
  },
  leaderboardList: {
    gap: 10,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  leaderRole: {
    fontSize: 10,
    color: '#9ca3af',
  },
  leaderRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
  },
  leaderDeals: {
    fontSize: 10,
    color: '#6b7280',
  },
  recentLeadCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
  },
  leadAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  leadAvatarMiniText: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 12,
  },
  leadCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  leadCardPhone: {
    fontSize: 11,
    color: '#9ca3af',
  },
  scorePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scorePillText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
  },
  leadCardBody: {
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    gap: 3,
  },
  leadPropType: {
    fontSize: 12,
    color: '#f3f4f6',
    fontWeight: '500',
  },
  leadBudget: {
    fontSize: 12,
    color: '#f3f4f6',
    fontWeight: '600',
  },
  leadCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageTag: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageTagText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
  },
  quickLeadActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
});
