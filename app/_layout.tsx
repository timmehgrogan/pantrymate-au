import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-url-polyfill/auto';
import { PantryProvider } from '@/context/PantryContext';
import { ShoppingProvider } from '@/context/ShoppingContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PantryProvider>
      <ShoppingProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ShoppingProvider>
    </PantryProvider>
  );
}
