import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PoultryRecord } from '@/app/types/PoultryRecord';

type RecordCardProps = {
  record: PoultryRecord;
  onPress: () => void;
};

const formatTitle = (recordType: PoultryRecord['recordType']): string =>
  recordType
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function RecordCard({ record, onPress }: RecordCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <Text style={styles.recordType}>{formatTitle(record.recordType)}</Text>
        <Text style={styles.date}>{record.date}</Text>
      </View>
      <Text style={styles.productionType}>{record.productionType.toUpperCase()}</Text>
      <Text style={styles.meta} numberOfLines={2}>
        {record.quantity !== undefined ? `Qty: ${record.quantity}  ` : ''}
        {record.cost !== undefined ? `Cost: ${record.cost}` : ''}
        {record.feedType ? `Feed: ${record.feedType}` : ''}
        {record.medicationName ? `Medication: ${record.medicationName}` : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  date: {
    fontSize: 12,
    color: '#5F6368',
  },
  productionType: {
    marginTop: 8,
    fontSize: 12,
    color: '#FBC02D',
    fontWeight: '700',
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: '#37474F',
  },
});
