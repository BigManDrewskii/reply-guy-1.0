import { createContext, useContext, useState, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// Context
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

// Root
export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange: onValueChangeProp, children, className }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

    const value = controlledValue ?? uncontrolledValue;
    const handleValueChange = (newValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue);
      }
      onValueChangeProp?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div ref={ref} className={className}>{children}</div>
      </TabsContext.Provider>
    );
  }
);

TabsRoot.displayName = 'TabsRoot';

// List
export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'relative inline-flex items-center gap-1 rounded-lg bg-muted/50 border border-border/50 p-1',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

// Trigger
export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, disabled = false, className }, ref) => {
    const context = useContext(TabsContext);

    if (!context) {
      throw new Error('TabsTrigger must be used within TabsRoot');
    }

    const { value: currentValue, onValueChange } = context;
    const isActive = currentValue === value;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => !disabled && onValueChange(value)}
        onKeyDown={(e) => {
          const triggers = Array.from(
            e.currentTarget.parentElement?.querySelectorAll('[role="tab"]') || []
          ) as HTMLButtonElement[];
          const currentIndex = triggers.indexOf(e.currentTarget);

          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
              e.preventDefault();
              const direction = e.key === 'ArrowLeft' ? -1 : 1;
              const nextIndex = (currentIndex + direction + triggers.length) % triggers.length;
              triggers[nextIndex]?.focus();
              triggers[nextIndex]?.click();
              break;
            case 'Home':
              e.preventDefault();
              triggers[0]?.focus();
              triggers[0]?.click();
              break;
            case 'End':
              e.preventDefault();
              triggers[triggers.length - 1]?.focus();
              triggers[triggers.length - 1]?.click();
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              e.currentTarget.click();
              break;
          }
        }}
        className={cn(
          'relative px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-primary-foreground': isActive,
            'text-muted-foreground hover:text-foreground hover:bg-card/50': !isActive,
          },
          className
        )}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// Content
export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className }, ref) => {
    const context = useContext(TabsContext);

    if (!context) {
      throw new Error('TabsContent must be used within TabsRoot');
    }

    const { value: currentValue } = context;
    const isActive = currentValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
        className={className}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';

// Compound component
const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export { Tabs };
