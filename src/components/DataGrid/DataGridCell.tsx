import React, { memo, useState, useRef, useEffect, useMemo } from "react";
import { ColumnSchema } from "./DataGrid.types";
import { useGridStore } from "./store/DataGridContext";
import { useStore } from "./store/createStore";
import { gridActions } from "./store/gridStore";

type DataGridCellProps = {
  value: any;
  row: any;
  rowIndex: number;
  column: ColumnSchema<any>;
  width: number;
  onChange?: (val: any) => void;
  validator?: (val: any) => Promise<boolean>;
  isFocused?: boolean;
  colIndex: number;
};

const DataGridCell: React.FC<DataGridCellProps> = memo(({ value, row, rowIndex, colIndex, column, width, isFocused }) => {
  const store = useGridStore();
  const isPinnedLeft = useStore(store, (s) => s.pinnedColumns.left.includes(column.id));
  const isPinnedRight = useStore(store, (s) => s.pinnedColumns.right.includes(column.id));
  const pinnedOffsets = useStore(store, (s) => s.pinnedOffsets);

  const actions = useMemo(() => gridActions(store), [store]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleCommit = async () => {
    if (editValue !== value) {
      await actions.updateCell(rowIndex, column.id, editValue, column.validator);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const style: React.CSSProperties = {
    width: width,
    minWidth: width,
    maxWidth: width,
  };

  if (isPinnedLeft) {
    style.position = 'sticky';
    style.left = pinnedOffsets[column.id];
    style.zIndex = 2; // Above normal cells
    style.backgroundColor = 'inherit'; // Ensure it's opaque (handled by row bg usually, but needs care)
  } else if (isPinnedRight) {
    style.position = 'sticky';
    style.right = pinnedOffsets[column.id];
    style.zIndex = 2;
    style.backgroundColor = 'inherit';
  }

  return (
    <div
      role="gridcell"
      aria-colindex={colIndex + 1}
      className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800 truncate bg-white dark:bg-black ${isFocused ? 'ring-2 ring-blue-500 z-50' : ''}`} // Added bg to ensure no see-through on sticky
      style={style}
      title={typeof value === 'string' ? value : undefined}
      onDoubleClick={() => {
        if (column.editable !== false) {
          setEditValue(value);
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full p-1 bg-white dark:bg-black border border-blue-500 outline-none rounded"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        column.renderCell ? column.renderCell(value, row) : value
      )}
    </div>
  );
});

DataGridCell.displayName = 'DataGridCell';

export default DataGridCell;