import { useBudgetStore } from '@/store';
import { DashboardSummary, CategoryCost } from '@/types';

export function useDashboard(): {
  summary: DashboardSummary;
  categoryCosts: CategoryCost[];
  progress: number;
} {
  const getDashboardSummary = useBudgetStore((s) => s.getDashboardSummary);
  const getCategoryCosts = useBudgetStore((s) => s.getCategoryCosts);
  const getPaymentProgress = useBudgetStore((s) => s.getPaymentProgress);

  return {
    summary: getDashboardSummary(),
    categoryCosts: getCategoryCosts(),
    progress: getPaymentProgress(),
  };
}
