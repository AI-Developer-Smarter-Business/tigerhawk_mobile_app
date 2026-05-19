import { Stack } from 'expo-router';

import { PP2Theme } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: PP2Theme.colors.background },
      }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
