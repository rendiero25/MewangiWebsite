import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface BreadcrumbContextType {
  titleMap: Record<string, string>;
  setBreadcrumbTitle: (path: string, title: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [titleMap, setTitleMap] = useState<Record<string, string>>({});

  const setBreadcrumbTitle = useCallback((path: string, title: string) => {
    setTitleMap((prev) => ({
      ...prev,
      [path]: title,
    }));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ titleMap, setBreadcrumbTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}
