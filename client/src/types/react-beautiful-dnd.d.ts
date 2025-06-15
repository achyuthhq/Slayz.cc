// This is a minimal type declaration file for react-beautiful-dnd
// It provides just enough type information to satisfy TypeScript

declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  // DroppableProvided
  export interface DroppableProvided {
    innerRef: React.RefObject<HTMLDivElement>;
    droppableProps: React.HTMLAttributes<HTMLDivElement>;
    placeholder?: React.ReactNode;
  }

  // DraggableProvided
  export interface DraggableProvided {
    innerRef: React.RefObject<HTMLDivElement>;
    draggableProps: React.HTMLAttributes<HTMLDivElement>;
    dragHandleProps: React.HTMLAttributes<HTMLDivElement> | null;
  }

  // DraggableStateSnapshot
  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating?: boolean;
    draggingOver?: string | null;
  }

  // DropResult
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    } | null;
    reason?: 'DROP' | 'CANCEL';
  }

  // Props
  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: any) => void;
    onDragUpdate?: (update: any) => void;
    children: React.ReactNode;
  }

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    direction?: 'vertical' | 'horizontal';
    isDropDisabled?: boolean;
    children: (provided: DroppableProvided) => React.ReactNode;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  }

  // Components as function components instead of class components
  export const DragDropContext: React.FC<DragDropContextProps>;
  export const Droppable: React.FC<DroppableProps>;
  export const Draggable: React.FC<DraggableProps>;
} 