// NavigationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  previousPage: string;
  setPreviousPage: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [previousPage, setPreviousPage] = useState<string>('');

  return (
    <NavigationContext.Provider value={{ previousPage, setPreviousPage }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
