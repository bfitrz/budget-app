import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Prace',
  subtitle: 'Etapy prac wykończeniowych i rozliczenia',
  groupField: 'etap',
  nameField: 'opis',
  columns: [
    { field: 'opis', label: 'Opis' },
  ],
  addFields: [
    { field: 'opis', label: 'Opis', required: true },
  ],
};

export function WykonczenieView() {
  const items = useBudgetStore((s) => s.wykonczenie) as unknown as CostItem[];
  const updateItem = useBudgetStore((s) => s.updateWykonczenieItem) as (id: string, updates: Partial<CostItem>) => void;
  const addItem = useBudgetStore((s) => s.addWykonczenieItem) as (item: Omit<CostItem, 'id'>) => void;
  const deleteItem = useBudgetStore((s) => s.deleteWykonczenieItem);

  return <CostCategoryView config={config} items={items} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} />;
}
