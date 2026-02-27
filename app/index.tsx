import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/app/components/EmptyState';
import RecordCard from '@/app/components/RecordCard';
import SectionHeader from '@/app/components/SectionHeader';
import SummaryCard from '@/app/components/SummaryCard';
import { PoultryRecord } from '@/app/types/PoultryRecord';
import { getRecords } from '@/app/utils/storage';

export default function DashboardScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<PoultryRecord[]>([]);

  const loadRecords = useCallback(async () => {
    const data = await getRecords();
    setRecords(data);
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, [loadRecords]),
  );

  const summary = useMemo(() => {
    const totalEggs = records
      .filter((record) => record.productionType === 'layers' && record.recordType === 'egg_collection')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    const totalFeed = records
      .filter((record) => record.recordType === 'feeding')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    const totalExpenses = records
      .filter((record) => record.recordType === 'expense')
      .reduce((sum, record) => sum + (record.cost ?? 0), 0);

    const mortalityCount = records
      .filter((record) => record.recordType === 'mortality')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    return { totalEggs, totalFeed, totalExpenses, mortalityCount, totalRecords: records.length };
  }, [records]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.container}
        data={records.slice(0, 10)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <SectionHeader title="Smart Poultry Records Offline" subtitle="Layers & Broilers dashboard" />
            <View style={styles.summaryGrid}>
              <SummaryCard title="Eggs Collected" value={summary.totalEggs.toString()} />
              <SummaryCard title="Feed Used" value={summary.totalFeed.toString()} />
              <SummaryCard title="Expenses" value={`$${summary.totalExpenses.toFixed(2)}`} />
              <SummaryCard title="Mortality" value={summary.mortalityCount.toString()} />
              <SummaryCard title="Total Records" value={summary.totalRecords.toString()} />
            </View>
            <SectionHeader title="Recent Records" />
          </>
        }
        renderItem={({ item }) => (
          <RecordCard record={item} onPress={() => router.push(`/records/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState message="Tap the + button to add your first poultry record." />}
      />

      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-record')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
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
    paddingBottom: 120,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 36,
    marginTop: -2,
  },
  settingsButton: {
    position: 'absolute',
    left: 20,
    bottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FBC02D',
  },
  settingsText: {
    color: '#1B5E20',
    fontWeight: '700',
  },
});
