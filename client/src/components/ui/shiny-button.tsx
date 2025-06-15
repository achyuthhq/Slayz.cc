import React from 'react';
import { Button } from './button';
import ShinyText from './shiny-text';
import { cn } from '@/lib/utils';

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  textSpeed?: number;
  href?: string;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, disabled, variant, size, asChild = false, textSpeed = 5, href, ...props }, ref) => {
    // If href is provided and asChild is false, wrap with an anchor
    const content = (
      <Button
        className={cn('rounded-xl', className)} // Slightly reduced border-radius
        disabled={disabled}
        variant={variant}
        size={size}
        asChild={asChild || !!href}
        ref={ref}
        {...props}
      >
        {href && !asChild ? (
          <a href={href}>
            {typeof children === 'string' ? (
              <ShinyText text={children} disabled={disabled} speed={textSpeed} />
            ) : (
              children
            )}
          </a>
        ) : (
          typeof children === 'string' ? (
            <ShinyText text={children} disabled={disabled} speed={textSpeed} />
          ) : (
            children
          )
        )}
      </Button>
    );

    return content;
  }
);

ShinyButton.displayName = 'ShinyButton';

export { ShinyButton }; 