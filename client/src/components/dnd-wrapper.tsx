import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useDragAndDropPolyfill } from '@/lib/dnd-polyfill';

interface DndWrapperProps {
  children: React.ReactNode;
  onDragEnd: (result: DropResult) => void;
}

/**
 * A wrapper component that handles drag and drop functionality
 * with polyfills for touch devices
 */
export function DndWrapper({ children, onDragEnd }: DndWrapperProps) {
  // Initialize the drag and drop polyfill for touch devices
  useDragAndDropPolyfill();

  // State for tracking drag operations
  const [isDragging, setIsDragging] = useState(false);

  // Ensure the component is mounted before rendering drag and drop
  const [mounted, setMounted] = React.useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Add a class to the body to prevent scrolling when dragging
    const handleTouchStart = () => {
      // We'll let the polyfill handle this now
    };
    
    const handleTouchEnd = () => {
      // We'll let the polyfill handle this now
    };
    
    // Listen for drag start and end events
    const handleDragStart = () => {
      console.log("DndWrapper: Drag started");
      setIsDragging(true);
      document.body.classList.add('is-dragging');
    };
    
    const handleDragEnd = () => {
      console.log("DndWrapper: Drag ended");
      setIsDragging(false);
      document.body.classList.remove('is-dragging');
    };
    
    // Add event listeners to track dragging state
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.body.classList.remove('is-dragging');
      document.body.classList.remove('touch-dragging');
    };
  }, []);

  // Handle drag end with additional feedback
  const handleDragEndWithFeedback = (result: DropResult) => {
    console.log("DndWrapper: handleDragEndWithFeedback called", result);
    
    // Play a sound effect or haptic feedback if available
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    // Reset dragging state
    setIsDragging(false);
    document.body.classList.remove('is-dragging');
    
    // Call the parent's onDragEnd handler
    onDragEnd(result);
  };

  if (!mounted) return null;

  return (
    <DragDropContext 
      onDragEnd={handleDragEndWithFeedback}
      onDragStart={() => {
        console.log("DragDropContext: Drag started");
        setIsDragging(true);
        document.body.classList.add('is-dragging');
      }}
    >
      <div className={isDragging ? "is-dragging-container" : ""}>
        {children}
      </div>
    </DragDropContext>
  );
} 