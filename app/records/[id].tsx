import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { PoultryRecord } from '@/app/types/PoultryRecord';
import { deleteRecord, getRecords, updateRecord } from '@/app/utils/storage';

export default function RecordDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<PoultryRecord | null>(null);
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [feedType, setFeedType] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      const records = await getRecords();
      const found = records.find((entry) => entry.id === id) ?? null;
      setRecord(found);
      if (found) {
        setDate(found.date);
        setQuantity(found.quantity !== undefined ? String(found.quantity) : '');
        setFeedType(found.feedType ?? '');
        setMedicationName(found.medicationName ?? '');
        setCost(found.cost !== undefined ? String(found.cost) : '');
        setNotes(found.notes ?? '');
      }
    };

    void load();
  }, [id]);

  const validationError = useMemo(() => {
    if (!record) {
      return 'Record not found.';
    }

    if (!date.trim()) {
      return 'Date is required.';
    }

    if ((record.recordType === 'feeding' || record.recordType === 'egg_collection' || record.recordType === 'mortality') &&
      (!quantity.trim() || Number.isNaN(Number(quantity)))) {
      return 'Valid quantity is required.';
    }

    if (record.recordType === 'feeding' && !feedType.trim()) {
      return 'Feed type is required.';
    }

    if (record.recordType === 'medication' && !medicationName.trim()) {
      return 'Medication name is required.';
    }

    if (record.recordType === 'expense' && (!cost.trim() || Number.isNaN(Number(cost)))) {
      return 'Valid cost is required.';
    }

    return '';
  }, [cost, date, feedType, medicationName, quantity, record]);

  const onUpdate = async () => {
    if (!record) {
      return;
    }

    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    const updatedRecord: PoultryRecord = {
      ...record,
      date: date.trim(),
      quantity: quantity.trim() ? Number(quantity) : undefined,
      feedType: feedType.trim() || undefined,
      medicationName: medicationName.trim() || undefined,
      cost: cost.trim() ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await updateRecord(updatedRecord);
      router.back();
    } catch {
      Alert.alert('Save Failed', 'Unable to save changes on this device. Please try again.');
    }
  };

  const onDelete = () => {
    if (!record) {
      return;
    }

    Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(record.id);
            router.back();
          } catch {
            Alert.alert('Delete Failed', 'Unable to delete this record right now.');
          }
        },
      },
    ]);
  };

  if (!record) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFound}>Record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Production Type</Text>
        <Text style={styles.staticValue}>{record.productionType.toUpperCase()}</Text>

        <Text style={styles.label}>Record Type</Text>
        <Text style={styles.staticValue}>{record.recordType.replace('_', ' ').toUpperCase()}</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} />

        {(record.recordType === 'feeding' ||
          record.recordType === 'egg_collection' ||
          record.recordType === 'mortality') && (
          <>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
          </>
        )}

        {record.recordType === 'feeding' && (
          <>
            <Text style={styles.label}>Feed Type</Text>
            <TextInput style={styles.input} value={feedType} onChangeText={setFeedType} />
          </>
        )}

        {record.recordType === 'medication' && (
          <>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput style={styles.input} value={medicationName} onChangeText={setMedicationName} />
          </>
        )}

        {record.recordType === 'expense' && (
          <>
            <Text style={styles.label}>Cost</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
            />
          </>
        )}

        {(record.recordType === 'expense' || record.recordType === 'medication') && (
          <>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </>
        )}

        <TouchableOpacity style={styles.updateButton} onPress={() => void onUpdate()}>
          <Text style={styles.updateButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { padding: 16, paddingBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 8, marginTop: 12 },
  staticValue: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#37474F',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#263238',
    fontSize: 16,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  updateButton: {
    marginTop: 24,
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 16,
  },
  notFoundWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    color: '#5F6368',
    fontSize: 16,
  },
});
