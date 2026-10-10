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
  Modal,
  TextInput,
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

// 7-Stage Funnel Data from Web Dashboard
const FUNNEL_STAGES = [
  { id: '1', name: 'New Lead', count: 120, pct: '100%', drop: '-', color: '#3b82f6', icon: 'mail-unread' as const },
  { id: '2', name: 'Assigned', count: 112, pct: '93.3%', drop: '93.3% allocated', color: '#a855f7', icon: 'shield-checkmark' as const },
  { id: '3', name: 'Calling (Callen)', count: 98, pct: '81.6%', drop: '87.5% contacted', color: '#f59e0b', icon: 'call' as const },
  { id: '4', name: 'Interested', count: 64, pct: '53.3%', drop: '65.3% qualified', color: '#10b981', icon: 'star' as const },
  { id: '5', name: 'Site Visit', count: 38, pct: '31.6%', drop: '59.3% booked', color: '#6366f1', icon: 'calendar' as const },
  { id: '6', name: 'Negotiation', count: 22, pct: '18.3%', drop: '57.8% offer', color: '#ef4444', icon: 'hand-left' as const },
  { id: '7', name: 'Converted (Client)', count: 16, pct: '13.3%', drop: '72.7% won', color: '#14b8a6', icon: 'checkmark-circle' as const },
];

// Source Insights from Web Dashboard
const SOURCE_INSIGHTS = [
  { source: 'Google Ads', count: 34, visits: 12, converted: 6, roi: '4.8x', color: '#2563eb', bg: '#eff6ff' },
  { source: 'Meta (FB / IG)', count: 42, visits: 14, converted: 5, roi: '3.9x', color: '#6366f1', bg: '#eef2ff' },
  { source: '99acres', count: 20, visits: 8, converted: 3, roi: '3.2x', color: '#d97706', bg: '#fffbeb' },
  { source: 'MagicBricks', count: 12, visits: 4, converted: 1, roi: '2.5x', color: '#e11d48', bg: '#fff1f2' },
  { source: 'Website / Landing', count: 8, visits: 4, converted: 2, roi: '6.1x', color: '#7c3aed', bg: '#f5f3ff' },
  { source: 'Walk-ins / Direct', count: 4, visits: 3, converted: 2, roi: '8.4x', color: '#059669', bg: '#ecfdf5' },
];

// Revenue Trajectory Data from Web
const REVENUE_TRAJECTORY: Record<string, { label: string; pipeline: number; booked: number }[]> = {
  '7d': [
    { label: 'Mon', pipeline: 1.2, booked: 0.4 },
    { label: 'Tue', pipeline: 1.8, booked: 0.6 },
    { label: 'Wed', pipeline: 2.1, booked: 0.7 },
    { label: 'Thu', pipeline: 1.9, booked: 0.5 },
    { label: 'Fri', pipeline: 2.8, booked: 1.1 },
    { label: 'Sat', pipeline: 3.4, booked: 1.5 },
    { label: 'Sun', pipeline: 2.6, booked: 0.9 },
  ],
  '30d': [
    { label: 'Wk 1', pipeline: 6.4, booked: 2.1 },
    { label: 'Wk 2', pipeline: 8.9, booked: 3.2 },
    { label: 'Wk 3', pipeline: 12.1, booked: 4.5 },
    { label: 'Wk 4', pipeline: 15.8, booked: 5.8 },
  ],
  '90d': [
    { label: 'Mo 1', pipeline: 14.2, booked: 5.1 },
    { label: 'Mo 2', pipeline: 22.8, booked: 8.6 },
    { label: 'Mo 3', pipeline: 31.4, booked: 12.4 },
  ],
  '1y': [
    { label: 'Q1', pipeline: 34.5, booked: 12.8 },
    { label: 'Q2', pipeline: 46.2, booked: 18.4 },
    { label: 'Q3', pipeline: 62.8, booked: 24.6 },
    { label: 'Q4', pipeline: 78.4, booked: 32.1 },
  ],
};

// Deal Stages Data from Web
const DEAL_STAGES_BREAKDOWN = [
  { name: 'New Inquiries', count: 128, value: '₹9.4 Cr', color: '#60a5fa' },
  { name: 'Contacted', count: 94, value: '₹7.2 Cr', color: '#818cf8' },
  { name: 'Site Visits', count: 58, value: '₹6.8 Cr', color: '#a78bfa' },
  { name: 'Negotiation', count: 34, value: '₹4.5 Cr', color: '#f59e0b' },
  { name: 'Booked / Won', count: 24, value: '₹3.9 Cr', color: '#10b981' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, isAdmin, isManager, isEmployee } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [funnelTab, setFunnelTab] = useState<'FUNNEL' | 'HIERARCHY' | 'SOURCES'>('FUNNEL');
  const [trajectoryMode, setTrajectoryMode] = useState<'value' | 'volume'>('value');
  const [captureModalVisible, setCaptureModalVisible] = useState(false);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProject, setNewLeadProject] = useState('Pride World City');
  const [newLeadBudget, setNewLeadBudget] = useState('₹85L - ₹1.1Cr');

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

  const handleWhatsApp = (phone: string, name: string, project = 'Tathastu Infra properties') => {
    const text = encodeURIComponent(
      `Hello ${name}, greetings from Tathastu Infra! Sharing details and brochure for ${project}.`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp for ${name}`);
    });
  };

  const handleSaveLead = () => {
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      Alert.alert('Validation Error', 'Please enter lead name and phone number.');
      return;
    }
    setCaptureModalVisible(false);
    setNewLeadName('');
    setNewLeadPhone('');
    Alert.alert('Lead Captured', `Successfully saved prospect ${newLeadName} for ${newLeadProject}.`);
  };

  const currentTrajectory = REVENUE_TRAJECTORY[period] || REVENUE_TRAJECTORY['30d'];
  const maxTrajectoryVal = Math.max(...currentTrajectory.map((t) => t.pipeline), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. TOP BRAND BAR */}
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

      {/* 2. GREETING & ROLE HEADER (MATCHING WEB EXACTLY) */}
      <View style={styles.greetingHeaderCard}>
        <View style={styles.greetingTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.greetingTitleRow}>
              <Text style={styles.greetingTitle}>
                Good afternoon, {currentUser.name.split(' ')[0]}!
              </Text>
              <View
                style={[
                  styles.roleBadgePill,
                  {
                    backgroundColor: isAdmin ? '#eff6ff' : isManager ? '#ecfdf5' : '#f5f3ff',
                    borderColor: isAdmin ? '#bfdbfe' : isManager ? '#a7f3d0' : '#ddd6fe',
                  },
                ]}
              >
                <Ionicons
                  name={isAdmin ? 'shield-checkmark' : isManager ? 'people' : 'call'}
                  size={12}
                  color={currentUser.badge_color}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.roleBadgeText, { color: currentUser.badge_color }]}>
                  {isAdmin ? 'Admin Panel' : isManager ? `Manager (${currentUser.team_name})` : 'Caller Workbench'}
                </Text>
              </View>
            </View>
            <Text style={styles.greetingSubtitle}>
              {isAdmin
                ? 'Company-wide sales velocity, omnichannel intake, and conversion intelligence.'
                : isManager
                ? `Regional pipeline overview for ${currentUser.team_name}, site visits, and quota.`
                : 'Your personalized calling queue, client site tours, and conversion milestones.'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: currentUser.badge_color }]}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.avatarText}>{currentUser.avatar}</Text>
          </TouchableOpacity>
        </View>

        {/* Period Filter Tabs and Capture Lead Button */}
        <View style={styles.filterActionBar}>
          <View style={styles.periodTabsWrap}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.periodTabItem, period === p.id && styles.periodTabItemActive]}
                onPress={() => setPeriod(p.id)}
              >
                <Text style={[styles.periodTabText, period === p.id && styles.periodTabTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.captureLeadBtn}
            onPress={() => setCaptureModalVisible(true)}
          >
            <Ionicons name="add-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.captureLeadBtnText}>+ Capture Lead</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. PRIMARY 4 KPI CARDS (MATCHING WEB KPI CARDS) */}
      <View style={styles.kpiGrid}>
        {/* KPI 1 */}
        <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/pipeline')}>
          <View style={styles.kpiCardHeader}>
            <Text style={styles.kpiLabel}>
              {isAdmin ? 'Active Pipeline' : isManager ? 'Team Pipeline' : 'Calling Queue'}
            </Text>
            <View style={[styles.kpiIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="business" size={16} color="#2563eb" />
            </View>
          </View>
          <Text style={styles.kpiNumber}>
            {isAdmin ? kpiData.pipeline : isManager ? '₹9.8 Cr' : '18 Leads'}
          </Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendPill}>
              <Text style={styles.trendPillText}>↑ +18.4% MoM</Text>
            </View>
            <Text style={styles.kpiSubtext}>4 active sites</Text>
          </View>
        </TouchableOpacity>

        {/* KPI 2 */}
        <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/leads')}>
          <View style={styles.kpiCardHeader}>
            <Text style={styles.kpiLabel}>
              {isAdmin ? 'Inbound Leads' : isManager ? 'Team Inflow' : 'Calls Today'}
            </Text>
            <View style={[styles.kpiIconBox, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="people" size={16} color="#10b981" />
            </View>
          </View>
          <Text style={styles.kpiNumber}>
            {isAdmin ? kpiData.leads : isManager ? '186 Leads' : '14 Calls'}
          </Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendPill}>
              <Text style={styles.trendPillText}>↑ +24.2% MoM</Text>
            </View>
            <Text style={styles.kpiSubtext}>99acres & Meta</Text>
          </View>
        </TouchableOpacity>

        {/* KPI 3 */}
        <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/leads')}>
          <View style={styles.kpiCardHeader}>
            <Text style={styles.kpiLabel}>
              {isAdmin ? 'Site Visits' : isManager ? 'Team Visits' : 'My Visits'}
            </Text>
            <View style={[styles.kpiIconBox, { backgroundColor: '#fffbeb' }]}>
              <Ionicons name="calendar" size={16} color="#f59e0b" />
            </View>
          </View>
          <Text style={styles.kpiNumber}>
            {isAdmin ? kpiData.visits : isManager ? '28 Scheduled' : '4 Visits'}
          </Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendPill}>
              <Text style={styles.trendPillText}>↑ +12.5% pace</Text>
            </View>
            <Text style={styles.kpiSubtext}>8 today</Text>
          </View>
        </TouchableOpacity>

        {/* KPI 4 */}
        <TouchableOpacity style={styles.kpiCard} onPress={() => router.push('/pipeline')}>
          <View style={styles.kpiCardHeader}>
            <Text style={styles.kpiLabel}>
              {isAdmin ? 'Closed Bookings' : isManager ? 'Team Booked' : 'My Bookings'}
            </Text>
            <View style={[styles.kpiIconBox, { backgroundColor: '#f5f3ff' }]}>
              <Ionicons name="trending-up" size={16} color="#8b5cf6" />
            </View>
          </View>
          <Text style={styles.kpiNumber}>
            {isAdmin ? kpiData.closed : isManager ? '₹2.4 Cr' : '₹1.15 Cr'}
          </Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendPill}>
              <Text style={styles.trendPillText}>↑ +31.8% MoM</Text>
            </View>
            <Text style={styles.kpiSubtext}>14 units sold</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. TATHASTU LEAD FLOW & CONVERSION INTELLIGENCE (FLAGSHIP WEB MODULE) */}
      <View style={styles.glassCard}>
        <View style={styles.moduleHeaderRow}>
          <View>
            <View style={styles.moduleTitleRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.moduleTitle}>Tathastu Infra • Lead Flow</Text>
            </View>
            <Text style={styles.moduleSubtitle}>Conversion intelligence & hierarchy</Text>
          </View>

          {/* Sub Tabs */}
          <View style={styles.funnelTabGroup}>
            <TouchableOpacity
              style={[styles.funnelTabBtn, funnelTab === 'FUNNEL' && styles.funnelTabBtnActive]}
              onPress={() => setFunnelTab('FUNNEL')}
            >
              <Text style={[styles.funnelTabBtnText, funnelTab === 'FUNNEL' && styles.funnelTabBtnTextActive]}>
                Funnel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.funnelTabBtn, funnelTab === 'HIERARCHY' && styles.funnelTabBtnActive]}
              onPress={() => setFunnelTab('HIERARCHY')}
            >
              <Text style={[styles.funnelTabBtnText, funnelTab === 'HIERARCHY' && styles.funnelTabBtnTextActive]}>
                Matrix
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.funnelTabBtn, funnelTab === 'SOURCES' && styles.funnelTabBtnActive]}
              onPress={() => setFunnelTab('SOURCES')}
            >
              <Text style={[styles.funnelTabBtnText, funnelTab === 'SOURCES' && styles.funnelTabBtnTextActive]}>
                ROI
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab 1: 7-Stage Conversion Funnel */}
        {funnelTab === 'FUNNEL' && (
          <View style={{ marginTop: 12 }}>
            <View style={styles.funnelGrid}>
              {FUNNEL_STAGES.map((st, idx) => (
                <TouchableOpacity
                  key={st.id}
                  style={styles.funnelStageBox}
                  onPress={() => router.push('/pipeline')}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.funnelStageIndex}>Stage {idx + 1}</Text>
                    <Ionicons name={st.icon} size={14} color={st.color} />
                  </View>
                  <Text style={styles.funnelStageCount}>{st.count}</Text>
                  <Text style={styles.funnelStageName} numberOfLines={1}>{st.name}</Text>
                  <View style={styles.funnelStageFooter}>
                    <Text style={[styles.funnelStagePct, { color: st.color }]}>{st.pct}</Text>
                    <Text style={styles.funnelStageDrop}>{st.drop}</Text>
                  </View>
                  <View style={[styles.funnelStageBottomLine, { backgroundColor: st.color }]} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Visual Funnel Stacked Progression Bar */}
            <View style={styles.funnelBarCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.funnelBarTitle}>Funnel Velocity & Win Rate</Text>
                <Text style={styles.funnelWinRateText}>13.3% Won (16/120)</Text>
              </View>
              <View style={styles.funnelTrackBar}>
                <View style={[styles.funnelSegment, { width: '20%', backgroundColor: '#3b82f6' }]} />
                <View style={[styles.funnelSegment, { width: '18%', backgroundColor: '#a855f7' }]} />
                <View style={[styles.funnelSegment, { width: '20%', backgroundColor: '#f59e0b' }]} />
                <View style={[styles.funnelSegment, { width: '18%', backgroundColor: '#10b981' }]} />
                <View style={[styles.funnelSegment, { width: '12%', backgroundColor: '#6366f1' }]} />
                <View style={[styles.funnelSegment, { width: '8%', backgroundColor: '#ef4444' }]} />
                <View style={[styles.funnelSegment, { width: '4%', backgroundColor: '#14b8a6' }]} />
              </View>
              <View style={styles.funnelMetricsRow}>
                <Text style={styles.funnelMetricItem}>First Contact: <Text style={{ fontWeight: '700', color: '#0f172a' }}>14m via Callen</Text></Text>
                <Text style={styles.funnelMetricItem}>Avg Cycle: <Text style={{ fontWeight: '700', color: '#0f172a' }}>18 Days</Text></Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Assignment Hierarchy Matrix */}
        {funnelTab === 'HIERARCHY' && (
          <View style={{ marginTop: 12 }}>
            {/* Manager 1: Anmol */}
            <View style={styles.matrixManagerCard}>
              <View style={styles.rowBetween}>
                <View style={styles.rowAlign}>
                  <View style={[styles.matrixAvatar, { backgroundColor: '#ecfdf5' }]}>
                    <Text style={[styles.matrixAvatarText, { color: '#059669' }]}>AN</Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.matrixManagerName}>Anmol</Text>
                    <Text style={styles.matrixManagerSub}>Sales Manager (MGR-001) • 64 Leads</Text>
                  </View>
                </View>
                <View style={styles.matrixClosedBadge}>
                  <Text style={styles.matrixClosedBadgeText}>9 Closed (₹6.8 Cr)</Text>
                </View>
              </View>

              <View style={styles.matrixRepList}>
                <View style={styles.matrixRepItem}>
                  <View>
                    <Text style={styles.matrixRepName}>Gayatri</Text>
                    <Text style={styles.matrixRepSub}>Caller (CLR-001) • 88 calls logged</Text>
                  </View>
                  <Text style={styles.matrixRepStats}>5 Visits / 4 Closed</Text>
                </View>

                <View style={styles.matrixRepItem}>
                  <View>
                    <Text style={styles.matrixRepName}>Direct Inbound Desk</Text>
                    <Text style={styles.matrixRepSub}>32 leads • 76 calls logged</Text>
                  </View>
                  <Text style={styles.matrixRepStats}>6 Visits / 5 Closed</Text>
                </View>
              </View>
            </View>

            {/* Manager 2: Priya Sharma */}
            <View style={[styles.matrixManagerCard, { marginTop: 10 }]}>
              <View style={styles.rowBetween}>
                <View style={styles.rowAlign}>
                  <View style={[styles.matrixAvatar, { backgroundColor: '#fffbeb' }]}>
                    <Text style={[styles.matrixAvatarText, { color: '#d97706' }]}>PS</Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.matrixManagerName}>Priya Sharma</Text>
                    <Text style={styles.matrixManagerSub}>Sales Manager (West) • 48 Leads</Text>
                  </View>
                </View>
                <View style={[styles.matrixClosedBadge, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
                  <Text style={[styles.matrixClosedBadgeText, { color: '#d97706' }]}>7 Closed (₹5.4 Cr)</Text>
                </View>
              </View>

              <View style={styles.matrixRepList}>
                <View style={styles.matrixRepItem}>
                  <View>
                    <Text style={styles.matrixRepName}>Vikram Malhotra</Text>
                    <Text style={styles.matrixRepSub}>24 leads • 64 calls logged</Text>
                  </View>
                  <Text style={styles.matrixRepStats}>4 Visits / 4 Closed</Text>
                </View>

                <View style={styles.matrixRepItem}>
                  <View>
                    <Text style={styles.matrixRepName}>Sneha Kulkarni</Text>
                    <Text style={styles.matrixRepSub}>24 leads • 59 calls logged</Text>
                  </View>
                  <Text style={styles.matrixRepStats}>4 Visits / 3 Closed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Lead Source ROI Table */}
        {funnelTab === 'SOURCES' && (
          <View style={{ marginTop: 12 }}>
            <View style={styles.roiTable}>
              <View style={styles.roiTableHeader}>
                <Text style={[styles.roiThText, { flex: 2 }]}>Channel</Text>
                <Text style={[styles.roiThText, { flex: 1, textAlign: 'center' }]}>Leads</Text>
                <Text style={[styles.roiThText, { flex: 1, textAlign: 'center' }]}>Visits</Text>
                <Text style={[styles.roiThText, { flex: 1, textAlign: 'center' }]}>Won</Text>
                <Text style={[styles.roiThText, { flex: 1, textAlign: 'right' }]}>ROI</Text>
              </View>
              {SOURCE_INSIGHTS.map((s) => (
                <View key={s.source} style={styles.roiTableRow}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.sourcePill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.sourcePillText, { color: s.color }]}>{s.source}</Text>
                    </View>
                  </View>
                  <Text style={[styles.roiTdText, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>{s.count}</Text>
                  <Text style={[styles.roiTdText, { flex: 1, textAlign: 'center', color: '#4f46e5' }]}>{s.visits}</Text>
                  <Text style={[styles.roiTdText, { flex: 1, textAlign: 'center', color: '#059669', fontWeight: '700' }]}>{s.converted}</Text>
                  <Text style={[styles.roiTdText, { flex: 1, textAlign: 'right', color: '#2563eb', fontWeight: '800' }]}>{s.roi}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 5. REVENUE & PIPELINE TRAJECTORY CHART (MATCHING WEB) */}
      <View style={styles.glassCard}>
        <View style={styles.rowBetween}>
          <View>
            <View style={styles.rowAlign}>
              <Ionicons name="trending-up" size={18} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>Revenue & Pipeline Trajectory</Text>
            </View>
            <Text style={styles.sectionHeaderSub}>Live progression of deals vs booked closings</Text>
          </View>
          <View style={styles.trendBadgeSmall}>
            <Text style={styles.trendBadgeSmallText}>+24.8%</Text>
          </View>
        </View>

        {/* Trajectory Bar Visualizer */}
        <View style={styles.trajectoryChartWrap}>
          {currentTrajectory.map((point, index) => {
            const pipelineHeight = (point.pipeline / maxTrajectoryVal) * 80;
            const bookedHeight = (point.booked / maxTrajectoryVal) * 80;
            return (
              <View key={index} style={styles.chartCol}>
                <View style={styles.barsContainer}>
                  {/* Pipeline bar */}
                  <View
                    style={[
                      styles.chartBarPipeline,
                      { height: Math.max(pipelineHeight, 14) },
                    ]}
                  />
                  {/* Booked bar */}
                  <View
                    style={[
                      styles.chartBarBooked,
                      { height: Math.max(bookedHeight, 8) },
                    ]}
                  />
                </View>
                <Text style={styles.chartColLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.chartLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#93c5fd' }]} />
            <Text style={styles.legendText}>Pipeline Trajectory (₹ Cr)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>Booked Revenue (₹ Cr)</Text>
          </View>
        </View>
      </View>

      {/* 6. URGENT FOLLOW-UPS & SITE VISITS BANNER */}
      <View style={styles.urgentBanner}>
        <View style={styles.urgentIconBox}>
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
            Missed follow-up for <Text style={{ fontWeight: '700', color: '#0f172a' }}>Vikram Rao</Text> (Pride World City) + 1 site visit scheduled at 11:00 AM with cab pickup.
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
              onPress={() => handleWhatsApp('+91 98231 44521', 'Vikram Rao', 'Pride World City')}
            >
              <Ionicons name="logo-whatsapp" size={14} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.urgentWaBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 7. CALLER BENCHMARK PROGRESS (SHOWN FOR CALLER OR ALL) */}
      <View style={styles.glassCard}>
        <View style={styles.rowBetween}>
          <View>
            <View style={styles.goalHeaderRow}>
              <View style={styles.goalTagPill}>
                <Text style={styles.goalTagText}>DAILY CALLING GOAL</Text>
              </View>
              <Text style={styles.goalSub}>Target: 25 Calls/Day</Text>
            </View>
            <Text style={styles.goalMainTitle}>14 Calls Completed <Text style={styles.goalSuccessPct}>(56% to Target)</Text></Text>
          </View>
          <Ionicons name="time" size={20} color="#8b5cf6" />
        </View>

        <View style={styles.goalTrack}>
          <View style={[styles.goalFill, { width: '56%' }]} />
        </View>

        <View style={styles.goalStatsGrid}>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatValue}>02m 45s</Text>
            <Text style={styles.goalStatLabel}>Avg Duration</Text>
            <Text style={styles.goalStatSubGreen}>✓ Optimal</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatValue}>78.5%</Text>
            <Text style={styles.goalStatLabel}>Connected</Text>
            <Text style={styles.goalStatSubGreen}>↑ High Pace</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatValue}>4 Tours</Text>
            <Text style={styles.goalStatLabel}>Site Visits</Text>
            <Text style={styles.goalStatSubBlue}>2 With Cab</Text>
          </View>
          <View style={styles.goalStatItem}>
            <Text style={styles.goalStatValue}>12 Dispatched</Text>
            <Text style={styles.goalStatLabel}>AI Messages</Text>
            <Text style={styles.goalStatSubPurple}>1-Click WA</Text>
          </View>
        </View>
      </View>

      {/* 8. GEMINI AI DEAL CO-PILOT CARD (WEB EQUIVALENT) */}
      <View style={styles.aiCopilotCard}>
        <View style={styles.rowBetween}>
          <View style={styles.rowAlign}>
            <Ionicons name="sparkles" size={18} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.aiCopilotTitle}>Gemini AI Deal Co-Pilot</Text>
          </View>
          <View style={styles.aiConfidenceBadge}>
            <Text style={styles.aiConfidenceText}>94% Confidence</Text>
          </View>
        </View>
        <Text style={styles.aiCopilotSub}>
          Automated intelligence based on recent lead activity & behavioral triggers
        </Text>

        <View style={styles.aiOpportunityBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.aiOppTitle}>🔥 CLOSING OPPORTUNITY</Text>
            <Text style={styles.aiOppTag}>Pride World City</Text>
          </View>
          <Text style={styles.aiOppDesc}>
            3 leads from the <Text style={{ fontWeight: '700', color: '#0f172a' }}>Pride World City</Text> campaign have viewed the price sheets multiple times today. Assigned executive <Text style={{ fontWeight: '700', color: '#2563eb' }}>Gayatri</Text> has high closing momentum in this bracket.
          </Text>

          <View style={styles.aiOppBtnRow}>
            <TouchableOpacity
              style={styles.aiSendPromptBtn}
              onPress={() => Alert.alert('AI Dispatch', 'AI Follow-up reminder dispatched to Gayatri via WhatsApp!')}
            >
              <Ionicons name="paper-plane" size={13} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.aiSendPromptBtnText}>Send Prompt to Rep</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiMatchmakerBtn}
              onPress={() => router.push('/properties')}
            >
              <Ionicons name="sparkles" size={13} color="#4338ca" style={{ marginRight: 6 }} />
              <Text style={styles.aiMatchmakerBtnText}>Launch AI Matchmaker</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.aiMetricsRow}>
          <View style={styles.aiMetricBox}>
            <Text style={styles.aiMetricLabel}>Round-Robin Health</Text>
            <Text style={styles.aiMetricVal}>100% Balanced</Text>
            <Text style={styles.aiMetricSub}>Avg response: 4.2m</Text>
          </View>
          <View style={styles.aiMetricBox}>
            <Text style={styles.aiMetricLabel}>Active Sites</Text>
            <Text style={styles.aiMetricVal}>4 Projects</Text>
            <Text style={styles.aiMetricSub}>₹18.4 Cr in evaluation</Text>
          </View>
        </View>
      </View>

      {/* 9. RECENT HIGH-INTENT LEADS STREAM (WEB MATCH) */}
      <View style={styles.glassCard}>
        <View style={styles.rowBetween}>
          <View>
            <View style={styles.rowAlign}>
              <Ionicons name="flame" size={18} color="#f97316" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>Recent High-Intent Leads</Text>
            </View>
            <Text style={styles.sectionHeaderSub}>Real-time inquiries requiring follow-up</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/leads')}>
            <Text style={styles.viewAllLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 12, gap: 10 }}>
          {[
            {
              id: '1',
              name: 'Vikram Malhotra',
              project: 'Pride World City (3 BHK)',
              budget: '₹85L - ₹1.1Cr',
              source: 'Facebook Ads',
              sourceColor: '#6366f1',
              sourceBg: '#eef2ff',
              score: 92,
              time: '10 mins ago',
              phone: '9820192831',
            },
            {
              id: '2',
              name: 'Pooja Deshmukh',
              project: 'Godrej Sky Greens (2 BHK)',
              budget: '₹65L - ₹75L',
              source: '99acres',
              sourceColor: '#059669',
              sourceBg: '#ecfdf5',
              score: 86,
              time: '32 mins ago',
              phone: '9871234509',
            },
            {
              id: '3',
              name: 'Rajesh Kulkarni',
              project: 'VTP Sierra Luxury Villa',
              budget: '₹1.8Cr - ₹2.2Cr',
              source: 'MagicBricks',
              sourceColor: '#d97706',
              sourceBg: '#fffbeb',
              score: 94,
              time: '1 hr ago',
              phone: '9988776655',
            },
          ].map((lead) => (
            <View key={lead.id} style={styles.leadStreamItem}>
              <View style={styles.rowBetween}>
                <View style={styles.rowAlign}>
                  <View style={styles.leadAvatarCircle}>
                    <Text style={styles.leadAvatarText}>
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <View style={styles.rowAlign}>
                      <Text style={styles.leadStreamName}>{lead.name}</Text>
                      <View style={[styles.leadStreamSourcePill, { backgroundColor: lead.sourceBg }]}>
                        <Text style={[styles.leadStreamSourceText, { color: lead.sourceColor }]}>
                          {lead.source}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.leadStreamSub}>
                      {lead.project} • <Text style={{ color: '#059669', fontWeight: '700' }}>{lead.budget}</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.leadScorePill}>
                  <Text style={styles.leadScoreText}>AI {lead.score}</Text>
                </View>
              </View>

              <View style={styles.leadStreamFooter}>
                <Text style={styles.leadStreamTime}>{lead.time}</Text>
                <View style={styles.leadActionBtnGroup}>
                  <TouchableOpacity
                    style={styles.leadActionIconBtn}
                    onPress={() => handleDialLead(lead.phone, lead.name)}
                  >
                    <Ionicons name="call" size={14} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.leadActionIconBtn}
                    onPress={() => handleWhatsApp(lead.phone, lead.name, lead.project)}
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.leadActionIconBtn}
                    onPress={() => router.push(`/lead/${lead.id}`)}
                  >
                    <Ionicons name="chevron-forward" size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 10. TEAM LEADERBOARD (MATCHING WEB) */}
      <View style={styles.glassCard}>
        <View style={styles.rowBetween}>
          <View>
            <View style={styles.rowAlign}>
              <Ionicons name="ribbon" size={18} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>Team Leaderboard</Text>
            </View>
            <Text style={styles.sectionHeaderSub}>Top revenue closers this month</Text>
          </View>
          <View style={styles.cupBadge}>
            <Ionicons name="trophy" size={14} color="#d97706" />
          </View>
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          {TEAM_LEADERBOARD.map((tm) => (
            <View key={tm.rank} style={styles.leaderRowItem}>
              <View
                style={[
                  styles.leaderRankPill,
                  tm.rank === 1
                    ? { backgroundColor: '#fef3c7' }
                    : tm.rank === 2
                    ? { backgroundColor: '#e2e8f0' }
                    : { backgroundColor: '#f1f5f9' },
                ]}
              >
                <Text
                  style={[
                    styles.leaderRankText,
                    tm.rank === 1 ? { color: '#d97706' } : { color: '#475569' },
                  ]}
                >
                  #{tm.rank}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.leaderRowName}>{tm.name}</Text>
                <Text style={styles.leaderRowRole}>{tm.role}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.leaderRowRevenue}>{tm.revenue}</Text>
                <Text style={styles.leaderRowDeals}>{tm.deals} Deals ({tm.conversion})</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 11. QUICK CAPTURE LEAD MODAL */}
      <Modal
        visible={captureModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCaptureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <Ionicons name="person-add" size={20} color="#2563eb" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Capture New Inbound Lead</Text>
              </View>
              <TouchableOpacity onPress={() => setCaptureModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Instantly enters lead into Callen dialer round-robin.</Text>

            <View style={styles.modalForm}>
              <Text style={styles.modalInputLabel}>Prospect Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Anand Deshpande"
                placeholderTextColor="#94a3b8"
                value={newLeadName}
                onChangeText={setNewLeadName}
              />

              <Text style={styles.modalInputLabel}>Phone Number (+91)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 9822019944"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={newLeadPhone}
                onChangeText={setNewLeadPhone}
              />

              <Text style={styles.modalInputLabel}>Interested Project</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Pride World City, Godrej Sky Greens..."
                placeholderTextColor="#94a3b8"
                value={newLeadProject}
                onChangeText={setNewLeadProject}
              />

              <Text style={styles.modalInputLabel}>Target Budget</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="₹85L - ₹1.2Cr"
                placeholderTextColor="#94a3b8"
                value={newLeadBudget}
                onChangeText={setNewLeadBudget}
              />

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveLead}>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitBtnText}>Save & Assign to Queue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // exact web background
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
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

  // 1. Brand Bar
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748b',
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

  // 2. Greeting Header Card
  greetingHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  greetingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  greetingTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  roleBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 17,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  filterActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  periodTabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    flex: 1,
  },
  periodTabItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabItemActive: {
    backgroundColor: '#2563eb',
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
  captureLeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  captureLeadBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // 3. KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.4%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    flex: 1,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  kpiFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  trendPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendPillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  kpiSubtext: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // 4. Glass Card
  glassCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  moduleSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  funnelTabGroup: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 2,
  },
  funnelTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  funnelTabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  funnelTabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  funnelTabBtnTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  funnelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  funnelStageBox: {
    width: '48.5%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  funnelStageIndex: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  funnelStageCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  funnelStageName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 1,
  },
  funnelStageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  funnelStagePct: {
    fontSize: 10,
    fontWeight: '800',
  },
  funnelStageDrop: {
    fontSize: 9,
    color: '#64748b',
  },
  funnelStageBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  funnelBarCard: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  funnelBarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  funnelWinRateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  funnelTrackBar: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 8,
  },
  funnelSegment: {
    height: '100%',
  },
  funnelMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  funnelMetricItem: {
    fontSize: 10,
    color: '#64748b',
  },

  // Matrix Styles
  matrixManagerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  matrixAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  matrixManagerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  matrixManagerSub: {
    fontSize: 10,
    color: '#64748b',
  },
  matrixClosedBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matrixClosedBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  matrixRepList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  matrixRepItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  matrixRepName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  matrixRepSub: {
    fontSize: 10,
    color: '#64748b',
  },
  matrixRepStats: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },

  // ROI Table
  roiTable: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  roiTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  roiThText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  roiTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  roiTdText: {
    fontSize: 11,
    color: '#334155',
  },
  sourcePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourcePillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // 5. Trajectory Chart
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  trendBadgeSmall: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendBadgeSmallText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  trajectoryChartWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 80,
  },
  chartBarPipeline: {
    width: 14,
    backgroundColor: '#93c5fd',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartBarBooked: {
    width: 14,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartColLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 6,
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },

  // 6. Urgent Banner
  urgentBanner: {
    backgroundColor: '#fff1f2',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecdd3',
    flexDirection: 'row',
    marginBottom: 14,
  },
  urgentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
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
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  urgentPillText: {
    color: '#881337',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  urgentDesc: {
    fontSize: 11,
    color: '#475569',
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
    paddingVertical: 6,
    borderRadius: 10,
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
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  urgentWaBtnText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },

  // 7. Goal Tracker
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  goalTagPill: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goalTagText: {
    color: '#7e22ce',
    fontSize: 9,
    fontWeight: '800',
  },
  goalSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  goalMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  goalSuccessPct: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  goalTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },
  goalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  goalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  goalStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  goalStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  goalStatSubGreen: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  goalStatSubBlue: {
    fontSize: 9,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 2,
  },
  goalStatSubPurple: {
    fontSize: 9,
    color: '#7c3aed',
    fontWeight: '700',
    marginTop: 2,
  },

  // 8. AI Copilot
  aiCopilotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginBottom: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  aiCopilotTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  aiConfidenceBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  aiConfidenceText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  aiCopilotSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  aiOpportunityBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  aiOppTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338ca',
  },
  aiOppTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366f1',
  },
  aiOppDesc: {
    fontSize: 11,
    color: '#334155',
    marginTop: 6,
    lineHeight: 16,
  },
  aiOppBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  aiSendPromptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 7,
    borderRadius: 10,
  },
  aiSendPromptBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  aiMatchmakerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingVertical: 7,
    borderRadius: 10,
  },
  aiMatchmakerBtnText: {
    color: '#4338ca',
    fontSize: 11,
    fontWeight: '700',
  },
  aiMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  aiMetricBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiMetricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  aiMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  aiMetricSub: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },

  // 9. Lead Stream
  viewAllLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  leadStreamItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leadAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  leadStreamName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  leadStreamSourcePill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  leadStreamSourceText: {
    fontSize: 9,
    fontWeight: '700',
  },
  leadStreamSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  leadScorePill: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leadScoreText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  leadStreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  leadStreamTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  leadActionBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  leadActionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 10. Team Leaderboard
  cupBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leaderRankPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  leaderRowName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  leaderRowRole: {
    fontSize: 10,
    color: '#64748b',
  },
  leaderRowRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  leaderRowDeals: {
    fontSize: 10,
    color: '#64748b',
  },

  // 11. Modal
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  modalForm: {
    marginTop: 16,
    gap: 10,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
