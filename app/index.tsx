import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import EmptyState from '@/app/components/EmptyState';
import RecordCard from '@/app/components/RecordCard';
import SectionHeader from '@/app/components/SectionHeader';
import SummaryCard from '@/app/components/SummaryCard';
import { PoultryRecord } from '@/app/types/PoultryRecord';
import { getRecords } from '@/app/utils/storage';

const recordTypeFilters: { label: string; value: PoultryRecord['recordType'] | 'all' }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Feeding', value: 'feeding' },
  { label: 'Medication', value: 'medication' },
  { label: 'Mortality', value: 'mortality' },
  { label: 'Eggs', value: 'egg_collection' },
  { label: 'Expenses', value: 'expense' },
];

const productionFilters: { label: string; value: PoultryRecord['productionType'] | 'all' }[] = [
  { label: 'All Flocks', value: 'all' },
  { label: 'Layers', value: 'layers' },
  { label: 'Broilers', value: 'broilers' },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Qty/Cost', value: 'impact' },
] as const;

type SortOption = (typeof sortOptions)[number]['value'];

const parseDateValue = (value: string) => new Date(value).getTime() || 0;

export default function DashboardScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<PoultryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<PoultryRecord['recordType'] | 'all'>('all');
  const [selectedProduction, setSelectedProduction] = useState<PoultryRecord['productionType'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = records.filter((record) => {
      if (selectedRecordType !== 'all' && record.recordType !== selectedRecordType) {
        return false;
      }

      if (selectedProduction !== 'all' && record.productionType !== selectedProduction) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const combined = [
        record.recordType,
        record.productionType,
        record.date,
        record.feedType,
        record.medicationName,
        record.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return combined.includes(normalizedSearch);
    });

    const sorted = [...filtered];

    if (sortBy === 'newest') {
      sorted.sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => parseDateValue(a.date) - parseDateValue(b.date));
    } else {
      sorted.sort((a, b) => {
        const aImpact = a.quantity ?? a.cost ?? 0;
        const bImpact = b.quantity ?? b.cost ?? 0;
        return bImpact - aImpact;
      });
    }

    return sorted;
  }, [records, searchQuery, selectedProduction, selectedRecordType, sortBy]);

  const summary = useMemo(() => {
    const totalEggs = filteredRecords
      .filter((record) => record.productionType === 'layers' && record.recordType === 'egg_collection')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    const totalFeed = filteredRecords
      .filter((record) => record.recordType === 'feeding')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    const totalExpenses = filteredRecords
      .filter((record) => record.recordType === 'expense')
      .reduce((sum, record) => sum + (record.cost ?? 0), 0);

    const mortalityCount = filteredRecords
      .filter((record) => record.recordType === 'mortality')
      .reduce((sum, record) => sum + (record.quantity ?? 0), 0);

    return {
      totalEggs,
      totalFeed,
      totalExpenses,
      mortalityCount,
      totalRecords: filteredRecords.length,
    };
  }, [filteredRecords]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRecords();
    setIsRefreshing(false);
  }, [loadRecords]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRecordType('all');
    setSelectedProduction('all');
    setSortBy('newest');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.container}
        data={filteredRecords.slice(0, 20)}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void onRefresh()} />}
        ListHeaderComponent={
          <>
            <SectionHeader title="Smart Poultry Records Offline" subtitle="Layers & Broilers dashboard" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by date, type, notes, medication..."
              placeholderTextColor="#9AA0A6"
            />

            <View style={styles.filterRow}>
              {productionFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[styles.filterChip, selectedProduction === filter.value && styles.filterChipActive]}
                  onPress={() => setSelectedProduction(filter.value)}
                >
                  <Text style={[styles.filterChipText, selectedProduction === filter.value && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterRow}>
              {recordTypeFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[styles.filterChip, selectedRecordType === filter.value && styles.filterChipActive]}
                  onPress={() => setSelectedRecordType(filter.value)}
                >
                  <Text style={[styles.filterChipText, selectedRecordType === filter.value && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sortRow}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.sortButton, sortBy === option.value && styles.sortButtonActive]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text style={[styles.sortText, sortBy === option.value && styles.sortTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryGrid}>
              <SummaryCard title="Eggs Collected" value={summary.totalEggs.toString()} />
              <SummaryCard title="Feed Used" value={summary.totalFeed.toString()} />
              <SummaryCard title="Expenses" value={`$${summary.totalExpenses.toFixed(2)}`} />
              <SummaryCard title="Mortality" value={summary.mortalityCount.toString()} />
              <SummaryCard title="Visible Records" value={summary.totalRecords.toString()} />
            </View>
            <SectionHeader title="Recent Records" />
          </>
        }
        renderItem={({ item }) => (
          <RecordCard record={item} onPress={() => router.push(`/records/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState message="No matching records. Try changing your filters." />}
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
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#263238',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  filterChipText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sortButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  sortText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 12,
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
  clearButton: {
    backgroundColor: '#FBC02D',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#1B5E20',
    fontWeight: '700',
    fontSize: 12,
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
