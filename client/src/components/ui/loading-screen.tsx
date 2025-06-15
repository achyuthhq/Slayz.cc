import React from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
  spinnerProps?: React.ComponentProps<typeof Spinner>;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  className,
  spinnerProps = { color: 'secondary', size: 'lg' }
}) => {
  return (
    <div 
      className={cn(
        'fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-black/50 border border-white/10">
        <Spinner {...spinnerProps} />
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 