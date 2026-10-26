import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui';
import { PlanProvider } from '@/store/plan';
import { C } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black, Caveat_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <PlanProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.paper } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="nina" options={{ presentation: 'modal' }} />
            <Stack.Screen name="dashboard" options={{ headerShown: true, title: 'Staff dashboard', headerTintColor: C.ink, headerTitleStyle: { fontFamily: 'Montserrat_800ExtraBold' } }} />
          </Stack>
        </ToastProvider>
      </PlanProvider>
    </SafeAreaProvider>
  );
}
