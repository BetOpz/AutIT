import { Tab, TAB_COLORS } from '../types/tab.types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar = ({ tabs, activeTabId, onTabChange }: TabBarProps) => {
  if (tabs.length === 0) return null;

  return (
    <div className="bg-[#F5F5F0] border-b-2 border-gray-200">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const colors = TAB_COLORS[tab.color];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 min-w-[120px] px-4 py-3 font-bold text-base
                transition-all duration-200
                ${isActive ? `${colors.bg} ${colors.text} border-b-4 ${colors.border}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.icon && <span className="text-2xl">{tab.icon}</span>}
                <span className="truncate max-w-full">{tab.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
