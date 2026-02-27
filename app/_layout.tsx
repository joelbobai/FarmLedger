import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1B5E20' },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: '#F8F9FA' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'FarmLedger – Poultry Edition' }} />
        <Stack.Screen name="add-record" options={{ title: 'Add Record' }} />
        <Stack.Screen name="records/[id]" options={{ title: 'Record Details' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
