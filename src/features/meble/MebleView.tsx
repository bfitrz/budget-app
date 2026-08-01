import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'Meblowanie',
  subtitle: 'Wykończenie mieszkania meblami i wyposażeniem — pogrupowane wg pomieszczeń',
  helpText: 'Meble, oświetlenie, dekoracje i wyposażenie do nowego mieszkania. Grupuj wg pomieszczeń, dodawaj alternatywy cenowe z różnych sklepów i śledź statusy płatności.',
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
