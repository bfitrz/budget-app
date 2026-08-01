import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Inne',
  subtitle: 'Dodatkowe koszty i wydatki',
  groupField: 'grupa',
  nameField: 'nazwa',
  columns: [
    { field: 'nazwa', label: 'Nazwa' },
  ],
  addFields: [
    { field: 'nazwa', label: 'Nazwa', required: true },
  ],
};

export function PozostaleView() {
  const items = useBudgetStore((s) => s.pozostale) as unknown as CostItem[];
  const updateItem = useBudgetStore((s) => s.updatePozostaleItem) as (id: string, updates: Partial<CostItem>) => void;
  const addItem = useBudgetStore((s) => s.addPozostaleItem) as (item: Omit<CostItem, 'id'>) => void;
  const deleteItem = useBudgetStore((s) => s.deletePozostaleItem);

  return <CostCategoryView config={config} items={items} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} />;
}
