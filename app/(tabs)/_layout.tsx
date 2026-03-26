import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  color: string;
  size: number;
  focused: boolean;
}

function TabBarIcon({ name, color, size, focused }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconsName)}
      size={size}
      color={color}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.tint,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: (props) => (
            <TabBarIcon name="basket" {...props} />
          ),
          headerTitle: '🧺 My Pantry',
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: (props) => (
            <TabBarIcon name="book" {...props} />
          ),
          headerTitle: '🍳 Recipes',
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: (props) => (
            <TabBarIcon name="cart" {...props} />
          ),
          headerTitle: '🛒 Shopping List',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: (props) => (
            <TabBarIcon name="barcode" {...props} />
          ),
          headerTitle: '📷 Scan Barcode',
          headerShown: false, // Camera screen has its own header
        }}
      />
    </Tabs>
  );
}
