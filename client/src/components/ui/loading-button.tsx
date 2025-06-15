import React from 'react';
import { Button, ButtonProps } from './button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  spinnerColor?: 'primary' | 'secondary' | 'white';
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText,
  className,
  spinnerColor = 'white',
  spinnerSize = 'sm',
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn('relative', className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-md">
          <Spinner color={spinnerColor} size={spinnerSize} />
        </span>
      )}
      <span className={cn(isLoading ? 'invisible' : 'visible')}>
        {loadingText && isLoading ? loadingText : children}
      </span>
    </Button>
  );
};

export default LoadingButton; 