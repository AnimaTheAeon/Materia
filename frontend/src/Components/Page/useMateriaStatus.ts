import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';

export interface MateriaStatus {
  // Short heading, e.g. "3 of 4 indexers equipped" or "No indexers yet".
  headline: string;
  // One plain sentence: the first problem, a next step, or "All systems ready".
  detail: string;
  hasProblem: boolean;
  hasError: boolean;
}

// The status line shared by the FFVII message bar and the Box of X status box,
// so both themes always say the same thing.
export default function useMateriaStatus(): MateriaStatus {
  const indexers = useSelector((state: AppState) => state.indexers.items);
  const health = useSelector(
    (state: AppState) => state.system.health?.items ?? []
  );

  if (!indexers.length) {
    return {
      headline: 'No indexers yet',
      detail: 'Add one under Indexers to start searching.',
      hasProblem: true,
      hasError: false,
    };
  }

  const equipped = indexers.filter((indexer) => indexer.enable).length;
  const problems = health.filter(
    (item) => item.type === 'error' || item.type === 'warning'
  );

  return {
    headline: `${equipped} of ${indexers.length} ${
      indexers.length === 1 ? 'indexer' : 'indexers'
    } equipped`,
    detail: problems.length ? problems[0].message : 'All systems ready.',
    hasProblem: problems.length > 0,
    hasError: problems.some((item) => item.type === 'error'),
  };
}
