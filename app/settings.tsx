import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { clearAllRecords } from '@/app/utils/storage';

const FARM_FEATURES = [
  'Offline-first data storage for uninterrupted use.',
  'Quick add flow for feeding, eggs, expenses, and mortality.',
  'Live dashboard totals for eggs, feed, costs, and records.',
  'Recent records timeline for fast review.',
  'One-tap record reset from settings.',
  'Record detail view for better traceability.',
  'Designed for both layers and broilers operations.',
  'Simple, low-distraction interface built for daily farm use.',
  'No login and no ads for privacy-focused operation.',
  'Lightweight app footprint for budget-friendly devices.',
];

export default function SettingsScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const onClear = () => {
    Alert.alert('Clear All Records', 'This action will permanently remove all saved records.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAllRecords();
            router.back();
          } catch {
            Alert.alert('Clear Failed', 'Unable to clear records right now.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>FarmLedger</Text>
          <Text style={styles.tagline}>Smart Poultry Records Offline</Text>
          <Text style={styles.info}>Version {appVersion}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.info}>Built for poultry farmers managing layers and broilers fully offline.</Text>
          <Text style={styles.info}>No internet, no account, no ads, and no permissions required.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Features</Text>
          {FARM_FEATURES.map((feature) => (
            <Text key={feature} style={styles.featureItem}>
              • {feature}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>Clear All Records</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    color: '#1B5E20',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    marginTop: 4,
    color: '#FBC02D',
    fontWeight: '700',
  },
  info: {
    marginTop: 8,
    color: '#37474F',
    fontSize: 14,
    lineHeight: 20,
  },
  featureItem: {
    marginTop: 6,
    color: '#37474F',
    fontSize: 14,
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
