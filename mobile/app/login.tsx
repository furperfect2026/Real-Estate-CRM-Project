import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth, PERSONAS } from '../hooks/use-auth';
import { THEME } from '../constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('rohit.nalpe@tathastuinfra.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, switchPersona } = useAuth();

  const handleQuickRole = async (personaId: string) => {
    setIsSubmitting(true);
    await switchPersona(personaId);
    const target = PERSONAS.find((p) => p.id === personaId);
    if (target) {
      setEmail(target.email);
      setPassword('password123');
    }
    setTimeout(() => {
      setIsSubmitting(false);
      router.replace('/(tabs)');
    }, 400);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Glass/White Card */}
        <View style={styles.card}>
          {/* Top Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={28} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.title}>Tathastu Infra CRM</Text>
          <Text style={styles.subtitle}>Select a role perspective or enter your credentials</Text>

          {/* Quick Demo Access by Role */}
          <View style={styles.quickRoleSection}>
            <Text style={styles.quickRoleHeader}>⚡ QUICK DEMO ACCESS BY ROLE</Text>

            {PERSONAS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.quickRoleCard, { borderLeftColor: p.badge_color }]}
                onPress={() => handleQuickRole(p.id)}
              >
                <View style={[styles.avatarPill, { backgroundColor: p.badge_color }]}>
                  <Text style={styles.avatarText}>{p.avatar}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.quickName}>{p.name}</Text>
                    <View style={[styles.rolePill, { backgroundColor: `${p.badge_color}18` }]}>
                      <Text style={[styles.rolePillText, { color: p.badge_color }]}>
                        {p.role === 'admin' ? 'Super Admin' : p.role === 'manager' ? 'Sales Head' : 'Telecaller'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.quickEmail}>{p.email}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#94a3b8" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in manually</Text>
            <View style={styles.dividerLine} />
          </View>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          {/* Form Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Corporate Email</Text>
            <TextInput
              style={styles.input}
              placeholder="name@tathastuinfra.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.signInButtonText}>Sign In to Workspace</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Tathastu Infra Sales ERP • Enterprise Multi-Role Edition
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // crisp off-white matching web
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff', // pure white card
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#2563eb', // royal blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a', // slate-900
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b', // slate-500
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  quickRoleSection: {
    marginBottom: 20,
  },
  quickRoleHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  quickRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  quickEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#0f172a',
  },
  signInButton: {
    backgroundColor: '#2563eb', // royal corporate blue
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  footerNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 18,
  },
});
