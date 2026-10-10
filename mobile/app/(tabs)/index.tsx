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
import { THEME } from '../../constants/Colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, isAdmin, isManager, isEmployee, switchPersona, personas } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

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
      {/* Top Brand Bar */}
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="business" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Tathastu Infra</Text>
            <Text style={styles.brandSubtitle}>Sales ERP & CRM Platform</Text>
          </View>
        </View>
        <View style={styles.liveSyncBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveSyncText}>Live Sync</Text>
        </View>
      </View>

      {/* Persona Switcher Card */}
      <View style={styles.personaCard}>
        <View style={styles.personaTopRow}>
          <View style={[styles.avatarCircle, { backgroundColor: currentUser.badge_color }]}>
            <Text style={styles.avatarText}>{currentUser.avatar}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.rowAlign}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: `${currentUser.badge_color}14`, borderColor: currentUser.badge_color }]}>
                <Text style={[styles.roleBadgeText, { color: currentUser.badge_color }]}>
                  {isAdmin ? 'ADMIN PANEL' : isManager ? 'MANAGER PANEL' : 'CALLER WORKBENCH'}
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
                  currentUser.id === p.id && { color: '#ffffff', fontWeight: '800' },
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
          style={styles.kpiCard}
          onPress={() => router.push('/pipeline')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Pipeline Value' : isManager ? 'Team Pipeline' : 'Calling Queue'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="trending-up" size={16} color="#2563eb" />
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
          style={styles.kpiCard}
          onPress={() => router.push('/leads')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Inbound Leads' : isManager ? 'Team Inflow' : 'Calls Today'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ecfdf5' }]}>
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
          style={styles.kpiCard}
          onPress={() => router.push('/leads')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Site Visits' : isManager ? 'Team Visits' : 'My Visits'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#fffbeb' }]}>
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
          style={styles.kpiCard}
          onPress={() => router.push('/pipeline')}
        >
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>
              {isAdmin ? 'Closed Bookings' : isManager ? 'Team Bookings' : 'My Bookings'}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#f5f3ff' }]}>
              <Ionicons name="trophy" size={16} color="#8b5cf6" />
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
            Missed follow-up for <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>Vikram Rao</Text> (Pride World City) + 1 site visit scheduled at 11:00 AM with cab pickup.
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
              <Ionicons name="logo-whatsapp" size={14} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.urgentWaBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Caller Performance Progress Bar */}
      <View style={styles.callerGoalCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.goalLabel}>DAILY CALLING TARGET</Text>
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
          <View style={[styles.qaIconWrap, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="call" size={20} color="#2563eb" />
          </View>
          <Text style={styles.qaTitle}>Callen Dialer</Text>
          <Text style={styles.qaSubtitle}>Start Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/properties')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: '#f5f3ff' }]}>
            <Ionicons name="sparkles" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.qaTitle}>AI Matchmaker</Text>
          <Text style={styles.qaSubtitle}>Fit Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/leads')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="person-add" size={20} color="#10b981" />
          </View>
          <Text style={styles.qaTitle}>Add Lead</Text>
          <Text style={styles.qaSubtitle}>Direct Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/properties')}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: '#fffbeb' }]}>
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
              <View style={[styles.sourceFill, { width: '42%', backgroundColor: '#2563eb' }]} />
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
              <View style={[styles.sourceFill, { width: '12%', backgroundColor: '#8b5cf6' }]} />
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
                    : { backgroundColor: '#cbd5e1' },
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
        <Text style={styles.sectionTitle}>High Priority Inbound Leads</Text>
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
              <Text style={{ color: '#64748b' }}>Requirement: </Text>
              {lead.property_type}
            </Text>
            <Text style={styles.leadBudget}>
              <Text style={{ color: '#64748b' }}>Budget: </Text>
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
                <Ionicons name="call" size={15} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleWhatsApp(lead.phone, lead.name)}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => router.push(`/lead/${lead.id}`)}
              >
                <Ionicons name="chevron-forward" size={15} color="#64748b" />
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
    backgroundColor: '#f8fafc', // crisp off-white background matching web
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
    borderRadius: 12,
    backgroundColor: '#2563eb', // royal blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a', // slate-900
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748b', // slate-500
    fontWeight: '500',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
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
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  personaCard: {
    backgroundColor: '#ffffff', // pure white card
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#0f172a',
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
    color: '#64748b',
    marginTop: 2,
  },
  switchPersonaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    gap: 8,
  },
  switchLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  personaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  personaBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodTabActive: {
    backgroundColor: '#2563eb', // royal blue
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  periodTabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.3%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    flex: 1,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  kpiFooter: {
    flexDirection: 'column',
    gap: 2,
  },
  trendUpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  kpiSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  urgentBanner: {
    backgroundColor: '#fff1f2', // light rose
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecdd3',
    flexDirection: 'row',
    marginBottom: 14,
  },
  urgentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9f1239',
  },
  urgentPill: {
    backgroundColor: '#fecdd3',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgentPillText: {
    color: '#9f1239',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  urgentDesc: {
    fontSize: 12,
    color: '#4c0519',
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
    backgroundColor: '#e11d48',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentWaBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  callerGoalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c3aed',
    letterSpacing: 0.5,
  },
  goalCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goalPillText: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  goalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  goalStatItem: {
    alignItems: 'center',
  },
  goalStatNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  goalStatLbl: {
    fontSize: 10,
    color: '#64748b',
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
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  stageScroll: {
    marginBottom: 16,
  },
  stageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    width: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  stageName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  stageCount: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  stageValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionBtn: {
    width: '23%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  qaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  qaTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  qaSubtitle: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#64748b',
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
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  sourceCount: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  sourceTrack: {
    height: 7,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceFill: {
    height: '100%',
    borderRadius: 4,
  },
  leaderboardList: {
    gap: 10,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
  },
  leaderRole: {
    fontSize: 11,
    color: '#64748b',
  },
  leaderRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  leaderDeals: {
    fontSize: 10,
    color: '#94a3b8',
  },
  recentLeadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  leadAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  leadAvatarMiniText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 12,
  },
  leadCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  leadCardPhone: {
    fontSize: 11,
    color: '#64748b',
  },
  scorePill: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scorePillText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '800',
  },
  leadCardBody: {
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    gap: 3,
  },
  leadPropType: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  leadBudget: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  leadCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stageTagText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  quickLeadActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
