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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const GREEN = '#2D6A4F';
const LIGHT_GREEN = '#F0F7F0';
const TEXT = '#1C2B1C';
const TEXT_SECONDARY = '#6B7B6B';
const BORDER = '#D4E0D4';
const BG = '#F5F5F0';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim().toLowerCase(), password);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.';
      setError(msg.includes('already registered') ? 'An account with this email already exists.' : msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={[styles.successIcon, { backgroundColor: GREEN }]}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Account Created!</Text>
        <Text style={styles.successText}>
          Check your email to confirm your account, then sign in.
        </Text>
        <TouchableOpacity
          style={[styles.signInBtn, { marginTop: 24 }]}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.signInText}>GO TO SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
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
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Free to get started</Text>

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
              placeholder="At least 6 characters"
              placeholderTextColor={TEXT_SECONDARY}
              secureTextEntry={!showPassword}
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

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={TEXT_SECONDARY}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signInText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign in link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: GREEN }]}>Sign in</Text>
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
  eyeBtn: { position: 'absolute', right: 12, top: 13 },
  signInBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  footer: { flexDirection: 'row', marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: TEXT_SECONDARY },
  footerLink: { fontSize: 14, fontWeight: '700' },
  successContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: TEXT, marginBottom: 12 },
  successText: { fontSize: 15, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 22 },
});
