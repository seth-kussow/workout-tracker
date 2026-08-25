import { useState } from 'react';
import { BottomNav, type Tab } from './components/nav/BottomNav';
import { TodayScreen } from './screens/today/TodayScreen';
import { PlanScreen } from './screens/plan/PlanScreen';
import { AssessmentsScreen } from './screens/assessments/AssessmentsScreen';
import { HistoryScreen } from './screens/history/HistoryScreen';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-slate-950 text-slate-100">
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1rem)]">
        {tab === 'today' && <TodayScreen />}
        {tab === 'plan' && <PlanScreen />}
        {tab === 'assessments' && <AssessmentsScreen />}
        {tab === 'history' && <HistoryScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
