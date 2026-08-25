export const TABS = ['today', 'plan', 'assessments', 'history'] as const;
export type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { label: string; icon: string }> = {
  today: { label: 'Today', icon: '🏋️' },
  plan: { label: 'Plan', icon: '📅' },
  assessments: { label: 'Assess', icon: '📈' },
  history: { label: 'History', icon: '🗂️' },
};

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const meta = TAB_META[tab];
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? 'text-sky-300' : 'text-slate-500'
              }`}
            >
              <span className="text-xl leading-none">{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
