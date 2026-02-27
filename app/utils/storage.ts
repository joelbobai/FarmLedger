import AsyncStorage from '@react-native-async-storage/async-storage';

import { PoultryRecord } from '@/app/types/PoultryRecord';

const STORAGE_KEY = 'POULTRY_RECORDS';

const parseRecords = (raw: string | null): PoultryRecord[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is PoultryRecord => {
      if (typeof item !== 'object' || item === null) {
        return false;
      }

      const record = item as Partial<PoultryRecord>;
      return (
        typeof record.id === 'string' &&
        (record.productionType === 'layers' || record.productionType === 'broilers') &&
        ['feeding', 'medication', 'mortality', 'egg_collection', 'expense'].includes(
          String(record.recordType),
        ) &&
        typeof record.date === 'string'
      );
    });
  } catch {
    return [];
  }
};

const saveRecords = async (records: PoultryRecord[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getRecords = async (): Promise<PoultryRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseRecords(raw);
  } catch {
    return [];
  }
};

export const addRecord = async (record: PoultryRecord): Promise<PoultryRecord[]> => {
  try {
    const records = await getRecords();
    const updated = [record, ...records];
    await saveRecords(updated);
    return updated;
  } catch {
    return [];
  }
};

export const updateRecord = async (updatedRecord: PoultryRecord): Promise<PoultryRecord[]> => {
  try {
    const records = await getRecords();
    const updated = records.map((record) =>
      record.id === updatedRecord.id ? updatedRecord : record,
    );
    await saveRecords(updated);
    return updated;
  } catch {
    return [];
  }
};

export const deleteRecord = async (id: string): Promise<PoultryRecord[]> => {
  try {
    const records = await getRecords();
    const updated = records.filter((record) => record.id !== id);
    await saveRecords(updated);
    return updated;
  } catch {
    return [];
  }
};

export const clearAllRecords = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
};

export { STORAGE_KEY };
