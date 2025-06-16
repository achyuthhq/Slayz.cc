import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to reset scroll position when navigating between pages
 */
export const useScrollRestoration = () => {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  useEffect(() => {
    // Only scroll to top if the location has changed
    if (location !== prevLocation.current) {
      window.scrollTo(0, 0);
      prevLocation.current = location;
    }
  }, [location]);
}; 