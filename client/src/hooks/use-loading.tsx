import React, { createContext, useContext, useState, ReactNode } from 'react';
import Loading from '@/components/ui/loading';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>('Loading...');

  const startLoading = (text?: string) => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <Loading fullScreen text={loadingText} spinnerProps={{ color: 'secondary' }} />}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider; 