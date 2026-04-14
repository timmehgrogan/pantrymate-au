import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function AppLogo({ tint }: { tint: string }) {
  return (
    <View style={[styles.logoContainer, { backgroundColor: tint }]}>
      <Ionicons name="basket" size={18} color="#fff" />
    </View>
  );
}

function HeaderTitle({ tint }: { tint: string }) {
  return (
    <View style={styles.headerTitleRow}>
      <AppLogo tint={tint} />
      <View>
        <Text style={styles.headerAppName}>
          <Text style={styles.headerBold}>Pantry</Text>
          <Text style={styles.headerLight}>Mate</Text>
        </Text>
        <Text style={[styles.headerAU, { color: tint }]}>AU</Text>
      </View>
    </View>
  );
}

function SignOutButton() {
  const { signOut, user } = useAuth();

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      `Sign out of ${user?.email ?? 'your account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (err) {
              console.error('Sign out error:', err);
            }
          },
        },
      ]
    );
  }

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
      <Ionicons name="log-out-outline" size={22} color="#6B7B6B" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarActiveBackgroundColor: theme.tabActiveBackground,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
          paddingHorizontal: 6,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 1,
        },
        headerStyle: {
          backgroundColor: theme.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerShadowVisible: false,
        headerTitle: () => <HeaderTitle tint={theme.tint} />,
        headerTitleAlign: 'left',
        headerRight: () => <SignOutButton />,
      }}
    >
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'PANTRY',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'RECIPES',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'SHOPPING',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'SCAN',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barcode" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'GAME',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAppName: {
    fontSize: 16,
    lineHeight: 18,
    color: '#1C2B1C',
  },
  headerBold: {
    fontWeight: '800',
    color: '#1C2B1C',
  },
  headerLight: {
    fontWeight: '400',
    color: '#1C2B1C',
  },
  headerAU: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: 13,
  },
  signOutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
