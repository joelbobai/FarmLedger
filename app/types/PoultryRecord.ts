export type PoultryRecord = {
  id: string;
  productionType: 'layers' | 'broilers';
  recordType: 'feeding' | 'medication' | 'mortality' | 'egg_collection' | 'expense';
  date: string;
  quantity?: number;
  feedType?: string;
  medicationName?: string;
  cost?: number;
  notes?: string;
};
