import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import 'react-native-url-polyfill/auto';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PantryProvider } from '@/context/PantryContext';
import { ShoppingProvider } from '@/context/ShoppingContext';

/**
 * AuthGate — redirects unauthenticated users to /auth/login
 * and authenticated users away from the auth screens.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Not signed in — send to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Already signed in — skip auth screens
      router.replace('/(tabs)/pantry');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F0' }}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PantryProvider>
        <ShoppingProvider>
          <AuthGate>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </AuthGate>
        </ShoppingProvider>
      </PantryProvider>
    </AuthProvider>
  );
}
