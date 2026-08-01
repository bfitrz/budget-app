import { CostCategoryView, CostCategoryConfig, CostItem } from '@/components';
import { useBudgetStore } from '@/store';

const config: CostCategoryConfig = {
  title: 'AGD / RTV',
  subtitle: 'Sprzęt domowy i elektronika — pogrupowane wg producenta',
  helpText: 'Sprzęt AGD (pralka, lodówka, zmywarka) i RTV (telewizor, soundbar). Pogrupowane wg producenta — łatwo porównać modele i ceny.',
  groupField: 'producent',
  nameField: 'nazwa',
  columns: [
    { field: 'nazwa', label: 'Nazwa' },
    { field: 'model', label: 'Model' },
  ],
  addFields: [
    { field: 'nazwa', label: 'Nazwa', required: true },
    { field: 'model', label: 'Model' },
  ],
};

export function AGDView() {
  const items = useBudgetStore((s) => s.agd) as unknown as CostItem[];
  const updateItem = useBudgetStore((s) => s.updateAGDItem) as (id: string, updates: Partial<CostItem>) => void;
  const addItem = useBudgetStore((s) => s.addAGDItem) as (item: Omit<CostItem, 'id'>) => void;
  const deleteItem = useBudgetStore((s) => s.deleteAGDItem);

  return <CostCategoryView config={config} items={items} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} />;
}
