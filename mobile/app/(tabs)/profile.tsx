import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/use-auth';

export default function ProfileScreen() {
  const { currentUser, switchPersona, personas, logout } = useAuth();
  const [autoDial, setAutoDial] = React.useState(true);
  const [callRecord, setCallRecord] = React.useState(true);
  const [soundAlerts, setSoundAlerts] = React.useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <View style={styles.profileHeaderCard}>
        <View style={[styles.avatarCircle, { backgroundColor: currentUser.badge_color }]}>
          <Text style={styles.avatarText}>{currentUser.avatar}</Text>
        </View>
        <Text style={styles.profileName}>{currentUser.name}</Text>
        <Text style={styles.profileEmail}>{currentUser.email}</Text>
        <View style={[styles.roleBadge, { borderColor: currentUser.badge_color }]}>
          <Text style={[styles.roleBadgeText, { color: currentUser.badge_color }]}>
            {currentUser.role_title}
          </Text>
        </View>
      </View>

      {/* Switch Persona / Role Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Simulate & Switch User Role</Text>
        <Text style={styles.sectionSubtitle}>Test different operational CRM permissions</Text>

        <View style={styles.personaList}>
          {personas.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.personaOption,
                currentUser.id === p.id && styles.personaOptionActive,
              ]}
              onPress={() => switchPersona(p.id)}
            >
              <View style={[styles.miniAvatar, { backgroundColor: p.badge_color }]}>
                <Text style={styles.miniAvatarText}>{p.avatar}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.personaOptionName}>{p.name}</Text>
                <Text style={styles.personaOptionRole}>{p.role_title}</Text>
              </View>
              {currentUser.id === p.id && (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Organization Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Organization Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLbl}>Company</Text>
          <Text style={styles.infoVal}>Tathastu Infra Pvt Ltd</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLbl}>Regional HQ</Text>
          <Text style={styles.infoVal}>FC Road, Pune, Maharashtra</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLbl}>Active Projects</Text>
          <Text style={styles.infoVal}>5 Live Developments</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLbl}>License</Text>
          <Text style={styles.infoVal}>Enterprise Tier (Unlimited)</Text>
        </View>
      </View>

      {/* Dialer & Call Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Callen Cloud Dialer</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLbl}>Auto-Dial Next Inbound Lead</Text>
            <Text style={styles.settingDesc}>Advances queue after disposition</Text>
          </View>
          <Switch value={autoDial} onValueChange={setAutoDial} trackColor={{ true: '#3b82f6', false: '#334155' }} />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLbl}>Call Recording & AI Transcripts</Text>
            <Text style={styles.settingDesc}>Enables waveform player & scoring</Text>
          </View>
          <Switch value={callRecord} onValueChange={setCallRecord} trackColor={{ true: '#3b82f6', false: '#334155' }} />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLbl}>Urgent Follow-Up Audio Chime</Text>
            <Text style={styles.settingDesc}>Play alert sound for overdue calls</Text>
          </View>
          <Switch value={soundAlerts} onValueChange={setSoundAlerts} trackColor={{ true: '#3b82f6', false: '#334155' }} />
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          logout();
          Alert.alert('Session Reset', 'Switched to primary Administrator view.');
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
        <Text style={styles.logoutBtnText}>Reset Session & Re-Authenticate</Text>
      </TouchableOpacity>

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
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
  },
  profileHeaderCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  profileEmail: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 10,
  },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 12,
  },
  personaList: {
    gap: 10,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  personaOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  miniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  personaOptionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  personaOptionRole: {
    fontSize: 11,
    color: '#94a3b8',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  infoLbl: {
    fontSize: 12,
    color: '#64748b',
  },
  infoVal: {
    fontSize: 12,
    color: '#f8fafc',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  settingLbl: {
    fontSize: 13,
    color: '#f8fafc',
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
});
