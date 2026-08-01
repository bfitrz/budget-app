import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Wykończenie',
  subtitle: 'Ściany, płytki, armatura, prace ekip — pogrupowane wg etapów',
  helpText: 'Prace wykończeniowe: malowanie, płytki, armatura, podłogi, instalacje itp. Pogrupowane wg etapów (np. Łazienka, Kuchnia, Elektryka). Kwoty to rozliczenia z ekipami i koszty materiałów.',
  groupField: 'etap',
  nameField: 'opis',
  costField: 'kwota',
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
