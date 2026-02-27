import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { PoultryRecord } from '@/app/types/PoultryRecord';
import { addRecord } from '@/app/utils/storage';

const recordTypeOptions: PoultryRecord['recordType'][] = [
  'feeding',
  'medication',
  'mortality',
  'egg_collection',
  'expense',
];

const formatRecordType = (value: PoultryRecord['recordType']) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function AddRecordScreen() {
  const router = useRouter();

  const [productionType, setProductionType] = useState<PoultryRecord['productionType']>('layers');
  const [recordType, setRecordType] = useState<PoultryRecord['recordType']>('feeding');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [feedType, setFeedType] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);

  const requiredError = useMemo(() => {
    if (!date.trim()) {
      return 'Date is required.';
    }

    if (recordType === 'feeding') {
      if (!feedType.trim()) {
        return 'Feed type is required.';
      }
      if (!quantity.trim() || Number.isNaN(Number(quantity))) {
        return 'Valid quantity is required for feeding.';
      }
    }

    if (recordType === 'egg_collection' || recordType === 'mortality') {
      if (!quantity.trim() || Number.isNaN(Number(quantity))) {
        return 'Valid quantity is required.';
      }
    }

    if (recordType === 'medication' && !medicationName.trim()) {
      return 'Medication name is required.';
    }

    if (recordType === 'expense' && (!cost.trim() || Number.isNaN(Number(cost)))) {
      return 'Valid cost is required.';
    }

    return '';
  }, [cost, date, feedType, medicationName, quantity, recordType]);

  const onSave = async () => {
    if (requiredError) {
      Alert.alert('Validation Error', requiredError);
      return;
    }

    const newRecord: PoultryRecord = {
      id: Date.now().toString(),
      productionType,
      recordType,
      date: date.trim(),
      quantity: quantity.trim() ? Number(quantity) : undefined,
      feedType: feedType.trim() || undefined,
      medicationName: medicationName.trim() || undefined,
      cost: cost.trim() ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
    };

    await addRecord(newRecord);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Production Type</Text>
        <View style={styles.segmentRow}>
          {(['layers', 'broilers'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.segmentButton, productionType === type && styles.segmentButtonActive]}
              onPress={() => setProductionType(type)}
            >
              <Text style={[styles.segmentText, productionType === type && styles.segmentTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Record Type</Text>
        <TouchableOpacity style={styles.selectInput} onPress={() => setShowTypeModal(true)}>
          <Text style={styles.selectInputText}>{formatRecordType(recordType)}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-01-31"
          placeholderTextColor="#9AA0A6"
        />

        {recordType === 'feeding' ? (
          <>
            <Text style={styles.label}>Feed Type</Text>
            <TextInput
              style={styles.input}
              value={feedType}
              onChangeText={setFeedType}
              placeholder="Starter Mash"
              placeholderTextColor="#9AA0A6"
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="40"
              placeholderTextColor="#9AA0A6"
            />
          </>
        ) : null}

        {recordType === 'medication' ? (
          <>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={medicationName}
              onChangeText={setMedicationName}
              placeholder="Antibiotic"
              placeholderTextColor="#9AA0A6"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Dosage and observations"
              placeholderTextColor="#9AA0A6"
            />
          </>
        ) : null}

        {recordType === 'egg_collection' || recordType === 'mortality' ? (
          <>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="120"
              placeholderTextColor="#9AA0A6"
            />
          </>
        ) : null}

        {recordType === 'expense' ? (
          <>
            <Text style={styles.label}>Cost</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              placeholder="100.50"
              placeholderTextColor="#9AA0A6"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Expense details"
              placeholderTextColor="#9AA0A6"
            />
          </>
        ) : null}

        <TouchableOpacity style={styles.saveButton} onPress={() => void onSave()}>
          <Text style={styles.saveButtonText}>Save Record</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={showTypeModal} animationType="fade" onRequestClose={() => setShowTypeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTypeModal(false)}>
          <View style={styles.modalCard}>
            {recordTypeOptions.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  setRecordType(type);
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{formatRecordType(type)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#263238',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segmentButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  segmentButtonActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  segmentText: {
    color: '#1B5E20',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectInputText: {
    color: '#263238',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#263238',
  },
});
