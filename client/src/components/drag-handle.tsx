import React from 'react';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  dragHandleProps: any;
  isDragging?: boolean;
  className?: string;
}

/**
 * A custom drag handle component that works well on both desktop and mobile devices.
 * Enhanced for better touch controls and visual feedback during drag operations.
 */
export function DragHandle({ dragHandleProps, isDragging, className = '' }: DragHandleProps) {
  return (
    <div
      {...dragHandleProps}
      className={`cursor-grab active:cursor-grabbing p-2 rounded-full 
        hover:bg-[#8e44ad]/30 transition-colors duration-200 
        touch-manipulation active:scale-110 active:bg-[#8e44ad]/40
        ${isDragging ? 'shadow-lg scale-110' : ''}
        ${className}`}
      aria-label="Drag handle"
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        background: isDragging 
          ? 'rgba(142, 68, 173, 0.5)' 
          : 'rgba(142, 68, 173, 0.2)',
        boxShadow: isDragging 
          ? '0 0 15px 5px rgba(142, 68, 173, 0.3)' 
          : 'none',
      }}
      data-testid="drag-handle"
    >
      <GripVertical className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-white/80'}`} />
    </div>
  );
} 