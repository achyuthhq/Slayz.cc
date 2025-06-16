import { useScrollRestoration } from '@/hooks/use-scroll-restoration';

/**
 * Component that resets scroll position when navigating between pages
 * Just include this once in your app, and it will handle scroll restoration
 */
export const ScrollToTop: React.FC = () => {
  // Use the hook for scroll restoration
  useScrollRestoration();
  
  // This component doesn't render anything
  return null;
}; 