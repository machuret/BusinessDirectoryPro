import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabGroupProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function TabGroup({ 
  tabs, 
  defaultTab, 
  onChange, 
  className,
  orientation = 'horizontal'
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Ensure we have valid tab refs array
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs.length]);

  const handleTabChange = (tabId: string, index: number) => {
    if (tabs[index]?.disabled) return;
    
    setActiveTab(tabId);
    onChange?.(tabId);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.map((tab, idx) => ({ ...tab, index: idx }))
      .filter(tab => !tab.disabled);
    
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.index === index);
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        if (orientation === 'horizontal' && e.key === 'ArrowDown') return;
        if (orientation === 'vertical' && e.key === 'ArrowRight') return;
        
        e.preventDefault();
        const nextEnabledIndex = currentEnabledIndex < enabledTabs.length - 1 
          ? currentEnabledIndex + 1 
          : 0;
        const nextTab = enabledTabs[nextEnabledIndex];
        handleTabChange(nextTab.id, nextTab.index);
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        if (orientation === 'horizontal' && e.key === 'ArrowUp') return;
        if (orientation === 'vertical' && e.key === 'ArrowLeft') return;
        
        e.preventDefault();
        const prevEnabledIndex = currentEnabledIndex > 0 
          ? currentEnabledIndex - 1 
          : enabledTabs.length - 1;
        const prevTab = enabledTabs[prevEnabledIndex];
        handleTabChange(prevTab.id, prevTab.index);
        break;

      case 'Home':
        e.preventDefault();
        const firstTab = enabledTabs[0];
        if (firstTab) {
          handleTabChange(firstTab.id, firstTab.index);
        }
        break;

      case 'End':
        e.preventDefault();
        const lastTab = enabledTabs[enabledTabs.length - 1];
        if (lastTab) {
          handleTabChange(lastTab.id, lastTab.index);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabChange(tabs[index].id, index);
        break;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'flex border-b border-border',
          orientation === 'vertical' && 'flex-col border-b-0 border-r'
        )}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'border-b-2 border-transparent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              orientation === 'vertical' && 'border-b-0 border-r-2 text-left',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
            onClick={() => handleTabChange(tab.id, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {activeTabContent}
      </div>
    </div>
  );
}