import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface ColumnSchema<T> {
  id: string;
  title: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  pinned?: "left" | "right" | false;
  
  // Custom Renderers & Editors
  renderCell?: (value: any, row: T) => ReactNode;
  renderHeader?: (column: ColumnSchema<T>) => ReactNode;
  
  // Editing
  editable?: boolean;
  editor?: (props: EditorProps<T>) => ReactNode;
  validator?: (value: any, row: T) => Promise<boolean | string>; // true if valid, string if error
}

export interface EditorProps<T> {
  value: any;
  row: T;
  onCommit: (newValue: any) => void;
  onCancel: () => void;
  isInvalid?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
}

export type GridProps<T> = {
  data: T[];
  columns: ColumnSchema<T>[];
  className?: string;
  style?: React.CSSProperties;
};

// Internal Types for the Store
export type ScrollPosition = {
  scrollTop: number;
  scrollLeft: number;
};

export type Dimensions = {
  width: number;
  height: number;
};