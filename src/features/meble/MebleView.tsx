import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Meble',
  subtitle: 'Wyposażenie mieszkania — pogrupowane wg pomieszczeń',
  groupField: 'pomieszczenie',
  nameField: 'nazwa',
  columns: [
    { field: 'kategoria', label: 'Kategoria', type: 'chip' },
    { field: 'nazwa', label: 'Nazwa' },
  ],
  addFields: [
    { field: 'kategoria', label: 'Kategoria', required: true },
    { field: 'nazwa', label: 'Nazwa', required: true },
  ],
};

export function MebleView() {
  const items = useBudgetStore((s) => s.meble) as unknown as CostItem[];
  const updateItem = useBudgetStore((s) => s.updateMebleItem) as (id: string, updates: Partial<CostItem>) => void;
  const addItem = useBudgetStore((s) => s.addMebleItem) as (item: Omit<CostItem, 'id'>) => void;
  const deleteItem = useBudgetStore((s) => s.deleteMebleItem);

  return <CostCategoryView config={config} items={items} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} />;
}
