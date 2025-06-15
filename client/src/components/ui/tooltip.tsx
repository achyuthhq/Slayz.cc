import * as React from "react"
import { cn } from "@/lib/utils"

// Create a tooltip implementation with hover functionality and attractive styling

interface TooltipProps {
  children: React.ReactNode
}

const TooltipProvider: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>
}

interface TooltipTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  delayDuration?: number
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  children,
  asChild = false,
  delayDuration = 300 // Default delay of 300ms
}) => {
  // Set up event handlers for hover state
  const [isHovered, setIsHovered] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, delayDuration);
  };
  
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100); // Shorter delay on hiding for better UX
  };

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="inline-flex relative cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-state={isHovered ? "open" : "closed"}
    >
      {children}
    </div>
  )
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  className,
  sideOffset = 4,
  side = 'top',
  ...props
}) => {
  // Define positioning classes based on the side prop
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2"
  };

  // Define arrow positioning classes based on the side prop
  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-[#1a1a1a] border-r-transparent border-b-transparent border-l-transparent",
    right: "left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-t-transparent border-r-[#1a1a1a] border-b-transparent border-l-transparent",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-t-transparent border-r-transparent border-b-[#1a1a1a] border-l-transparent",
    left: "right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-t-transparent border-r-transparent border-b-transparent border-l-[#1a1a1a]"
  };

  return (
    <>
      <div
        className={cn(
          "z-50 absolute overflow-hidden rounded-lg bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-white/10 px-4 py-2.5 text-sm text-white shadow-xl min-w-max max-w-xs",
          positionClasses[side],
          "opacity-0 invisible data-[state=open]:opacity-100 data-[state=open]:visible",
          "transition-all duration-200 ease-in-out",
          "backdrop-blur-sm bg-opacity-95",
          "font-medium leading-relaxed tracking-wide",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {typeof children === 'string' ? (
            <p className="text-white/90">{children}</p>
          ) : (
            children
          )}
        </div>
      </div>
      {/* Arrow element */}
      <div
        className={cn(
          "absolute w-0 h-0 border-solid border-4",
          arrowClasses[side],
          "opacity-0 invisible data-[state=open]:opacity-100 data-[state=open]:visible",
          "transition-all duration-200 ease-in-out",
          "drop-shadow-md"
        )}
      />
    </>
  )
}

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  delayDuration,
  ...props
}) => {
  // Pass delayDuration to children if they are TooltipTrigger
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === TooltipTrigger) {
      return React.cloneElement(child, { delayDuration } as any);
    }
    return child;
  });

  return (
    <div className="relative inline-block">
      {childrenWithProps}
    </div>
  )
}

export { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
}
