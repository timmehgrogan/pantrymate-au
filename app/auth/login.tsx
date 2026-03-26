import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const GREEN = '#2D6A4F';
const LIGHT_GREEN = '#F0F7F0';
const TEXT = '#1C2B1C';
const TEXT_SECONDARY = '#6B7B6B';
const BORDER = '#D4E0D4';
const BG = '#F5F5F0';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Navigation happens automatically via AuthGate in _layout.tsx
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      setError(msg.includes('Invalid login') ? 'Incorrect email or password.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoBox, { backgroundColor: GREEN }]}>
            <Ionicons name="basket" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>
            <Text style={styles.bold}>Pantry</Text>
            <Text style={styles.light}>Mate</Text>
          </Text>
          <Text style={styles.auBadge}>AU</Text>
          <Text style={styles.tagline}>Your family's smart pantry</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={TEXT_SECONDARY}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={TEXT_SECONDARY}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signInText}>SIGN IN</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: GREEN }]}>Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 28, lineHeight: 32 },
  bold: { fontWeight: '800', color: TEXT },
  light: { fontWeight: '300', color: TEXT },
  auBadge: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: GREEN,
    marginTop: 2,
  },
  tagline: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 6 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 20 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 13, color: '#DC2626', flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: TEXT_SECONDARY,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
    backgroundColor: LIGHT_GREEN,
    marginBottom: 14,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 44 },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  signInBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: { fontSize: 14, color: TEXT_SECONDARY },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
