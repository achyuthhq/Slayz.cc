/**
 * Polyfill for HTML5 Drag and Drop API
 * This ensures that the drag and drop functionality works in all browsers,
 * especially for react-beautiful-dnd
 */

import { useEffect } from 'react';

export function initDragAndDropPolyfill() {
  // Only run this in the browser
  if (typeof window === 'undefined') return;

  // Check if browser already has these events
  if (!('ontouchstart' in window)) return;

  console.log('Initializing drag and drop polyfill for touch devices');

  // Create a fake "drag" event
  const createDragEvent = (eventName: string) => {
    return (originalEvent: TouchEvent) => {
      const touch = originalEvent.touches[0] || originalEvent.changedTouches[0];
      const event = new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
      });

      // Add dataTransfer property
      Object.defineProperty(event, 'dataTransfer', {
        value: {
          setData: () => {},
          getData: () => {},
          setDragImage: () => {},
          effectAllowed: 'move',
        },
        enumerable: true,
      });

      return event;
    };
  };

  // Track touch start position
  let touchStartElement: HTMLElement | null = null;
  let isDragging = false;
  let dragStartY = 0;
  let dragThreshold = 5; // Minimum pixels to move before starting drag

  window.addEventListener('touchstart', (event: TouchEvent) => {
    // Store the element where the touch started
    touchStartElement = event.target as HTMLElement;
    
    // Store initial Y position
    dragStartY = event.touches[0].clientY;
    
    // Find the closest draggable element
    const closestDraggable = (event.target as HTMLElement).closest('[data-rbd-draggable-id]');
    
    if (closestDraggable) {
      // We're starting on a draggable element - disable default scrolling behavior
      event.preventDefault();
      console.log('Touch start on draggable element', closestDraggable.getAttribute('data-rbd-draggable-id'));
    }
  }, { passive: false });

  window.addEventListener('touchmove', (event: TouchEvent) => {
    if (!touchStartElement) return;
    
    const touch = event.touches[0];
    const deltaY = Math.abs(touch.clientY - dragStartY);
    
    // Check if we're on a draggable element or one of its children
    const closestDraggable = (event.target as HTMLElement).closest('[data-rbd-draggable-id]');
    const dragHandle = (event.target as HTMLElement).closest('[data-rbd-drag-handle-draggable-id]');
    
    // Only initiate drag if we're past the threshold and on a drag handle
    if (deltaY > dragThreshold && dragHandle && !isDragging) {
      const dragStartEvent = createDragEvent('dragstart')(event);
      touchStartElement.dispatchEvent(dragStartEvent);
      isDragging = true;
      
      console.log('Drag initiated on element', dragHandle.getAttribute('data-rbd-drag-handle-draggable-id'));
      
      // Add dragging class to body
      document.body.classList.add('touch-dragging');
      
      // Prevent scrolling while dragging
      event.preventDefault();
    }
    
    // If already dragging, dispatch drag events and prevent default scrolling
    if (isDragging) {
      // Prevent scrolling
      event.preventDefault();
      
      // Create and dispatch drag event
      const dragEvent = createDragEvent('drag')(event);
      touchStartElement.dispatchEvent(dragEvent);
    }
  }, { passive: false });

  window.addEventListener('touchend', (event: TouchEvent) => {
    if (!isDragging) return;
    
    // Create and dispatch the drop event
    const dropEvent = createDragEvent('drop')(event);
    const target = document.elementFromPoint(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY
    );
    
    if (target) {
      console.log('Drop event on target', target);
      target.dispatchEvent(dropEvent);
    }
    
    // Create and dispatch dragend event
    const dragEndEvent = createDragEvent('dragend')(event);
    if (touchStartElement) {
      touchStartElement.dispatchEvent(dragEndEvent);
    }
    
    // Remove dragging class
    document.body.classList.remove('touch-dragging');
    
    // Reset state
    touchStartElement = null;
    isDragging = false;
    
    console.log('Drag operation completed');
  }, { passive: false });
  
  // Cancel drag on touch cancel
  window.addEventListener('touchcancel', (event: TouchEvent) => {
    if (isDragging) {
      console.log('Drag operation cancelled');
      document.body.classList.remove('touch-dragging');
      touchStartElement = null;
      isDragging = false;
    }
  }, { passive: false });
}

// Custom hook for using the polyfill in React components
export function useDragAndDropPolyfill() {
  useEffect(() => {
    // Initialize the polyfill when component mounts
    initDragAndDropPolyfill();
    
    // Return cleanup function
    return () => {
      // Ensure touch-dragging class is removed when component unmounts
      document.body.classList.remove('touch-dragging');
    };
  }, []);
} 