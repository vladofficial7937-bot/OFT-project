/**
 * Каталог: Карта мышц + Список упражнений в виде табов
 */

import { useSearchParams } from 'react-router-dom';
import type { MuscleGroup } from '../../data/models/types';
import Tabs from '../../components/ui/Tabs';
import MuscleMap from './MuscleMap';
import ExerciseCatalog from './ExerciseCatalog';

const TAB_MAP = 'map';
const TAB_LIST = 'list';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') ?? TAB_LIST) === TAB_MAP ? TAB_MAP : TAB_LIST;

  const setTab = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    if (id === TAB_MAP) next.delete('muscle');
    setSearchParams(next, { replace: true });
  };

  const handleMuscleClick = (muscleGroup: MuscleGroup) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', TAB_LIST);
    next.set('muscle', muscleGroup);
    setSearchParams(next, { replace: true });
  };

  const tabs = [
    { id: TAB_MAP, label: 'Карта мышц', icon: '🗺️' },
    { id: TAB_LIST, label: 'Список упражнений', icon: '📚' },
  ];

  return (
    <div className="safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 min-w-0">
        <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>
      {tab === TAB_MAP ? (
        <MuscleMap onMuscleClick={handleMuscleClick} />
      ) : (
        <ExerciseCatalog />
      )}
    </div>
  );
}
