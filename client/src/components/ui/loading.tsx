import React from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
  spinnerProps?: React.ComponentProps<typeof Spinner>;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  text = 'Loading...',
  className,
  spinnerProps
}) => {
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'w-full py-8',
    className
  );

  return (
    <div className={containerClasses}>
      <Spinner {...spinnerProps} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default Loading; 