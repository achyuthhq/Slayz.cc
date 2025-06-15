import React from 'react';
import { ShinyButton } from './shiny-button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface ShinyLoadingButtonProps extends React.ComponentProps<typeof ShinyButton> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerColor?: 'primary' | 'secondary' | 'white';
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const ShinyLoadingButton = React.forwardRef<HTMLButtonElement, ShinyLoadingButtonProps>(
  ({ 
    children, 
    isLoading = false, 
    loadingText, 
    className, 
    spinnerColor = 'white', 
    spinnerSize = 'sm',
    disabled,
    ...props 
  }, ref) => {
    return (
      <ShinyButton
        ref={ref}
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
      </ShinyButton>
    );
  }
);

ShinyLoadingButton.displayName = 'ShinyLoadingButton';

export default ShinyLoadingButton; 