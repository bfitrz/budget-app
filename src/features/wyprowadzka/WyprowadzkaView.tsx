import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Wyprowadzka',
  subtitle: 'Koszty związane z przeprowadzką',
  groupField: 'grupa',
  nameField: 'nazwa',
  columns: [
    { field: 'nazwa', label: 'Nazwa' },
  ],
  addFields: [
    { field: 'nazwa', label: 'Nazwa', required: true },
  ],
};

export function WyprowadzkaView() {
  const items = useBudgetStore((s) => s.wyprowadzka) as unknown as CostItem[];
  const updateItem = useBudgetStore((s) => s.updateWyprowadzkaItem) as (id: string, updates: Partial<CostItem>) => void;
  const addItem = useBudgetStore((s) => s.addWyprowadzkaItem) as (item: Omit<CostItem, 'id'>) => void;
  const deleteItem = useBudgetStore((s) => s.deleteWyprowadzkaItem);

  return <CostCategoryView config={config} items={items} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} />;
}
