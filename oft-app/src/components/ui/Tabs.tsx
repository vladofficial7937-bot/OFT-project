/**
 * Переиспользуемый компонент табов
 */

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div
      className="border-b mb-6"
      style={{ borderColor: 'var(--color-border)' }}
      role="tablist"
    >
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`px-6 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? ''
                : 'hover:opacity-70'
            }`}
            style={{
              color:
                activeTab === tab.id
                  ? '#ffffff'
                  : 'var(--color-text-secondary)',
              borderBottom:
                activeTab === tab.id
                  ? '2px solid #FF0000'
                  : '2px solid transparent',
              textShadow: activeTab === tab.id ? '0 0 15px #FF0000' : 'none',
            }}
          >
            {tab.icon && <span className="mr-2" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
