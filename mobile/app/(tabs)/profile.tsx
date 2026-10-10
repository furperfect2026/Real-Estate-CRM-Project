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
import { THEME } from '../../constants/Colors';

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
        <View style={[styles.roleBadge, { backgroundColor: `${currentUser.badge_color}14`, borderColor: currentUser.badge_color }]}>
          <Text style={[styles.roleBadgeText, { color: currentUser.badge_color }]}>
            {currentUser.role_title}
          </Text>
        </View>
      </View>

      {/* Switch Persona / Role Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Simulate & Switch User Role</Text>
        <Text style={styles.sectionSubtitle}>Test different operational CRM perspectives</Text>

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
          <Text style={styles.infoVal}>Enterprise Multi-Tenant Edition</Text>
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
          <Switch value={autoDial} onValueChange={setAutoDial} trackColor={{ true: '#2563eb', false: '#cbd5e1' }} />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLbl}>Call Recording & QA Transcripts</Text>
            <Text style={styles.settingDesc}>Enables waveform scrubber player</Text>
          </View>
          <Switch value={callRecord} onValueChange={setCallRecord} trackColor={{ true: '#2563eb', false: '#cbd5e1' }} />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLbl}>Urgent Follow-Up Audio Chime</Text>
            <Text style={styles.settingDesc}>Plays alert sound for overdue calls</Text>
          </View>
          <Switch value={soundAlerts} onValueChange={setSoundAlerts} trackColor={{ true: '#2563eb', false: '#cbd5e1' }} />
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
        <Ionicons name="log-out-outline" size={18} color="#e11d48" style={{ marginRight: 6 }} />
        <Text style={styles.logoutBtnText}>Reset Session & Re-Authenticate</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748b',
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
    fontWeight: '800',
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
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  personaList: {
    gap: 10,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  personaOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  personaOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  personaOptionRole: {
    fontSize: 11,
    color: '#64748b',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLbl: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLbl: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#e11d48',
    fontWeight: '800',
    fontSize: 13,
  },
});
