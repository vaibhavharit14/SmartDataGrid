
import React, { memo } from "react";
import { useGridStore } from "./store/DataGridContext";
import { useStore } from "./store/createStore";
import DataGridCell from "./DataGridCell";
import { RenderableColumn } from "./InternalDataGrid";

type DataGridRowProps = {
  rowIndex: number;
  dataRowCount: number;
  row: any;
  renderableColumns: RenderableColumn[];
  style: React.CSSProperties;
};

const DataGridRow: React.FC<DataGridRowProps> = memo(({ rowIndex, dataRowCount, row, renderableColumns, style }) => {
  const store = useGridStore();
  const columns = useStore(store, (s) => s.columns);

  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-setsize={dataRowCount + 1}
      aria-posinset={rowIndex + 2}
      className="flex border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-zinc-900/50 box-border"
      style={style}
    >
      {renderableColumns.map((rCol) => {
        const col = columns[rCol.index];
        // If pinned, sticky logic is in Cell. But Cell is wrapped here?
        // Wait, earlier I said "Cell should be sticky".
        // If I wrap Cell in a div here, I need to pass sticky to that div or just render Cell directly?
        // Let's render Cell directly to avoid extra wrappers invalidating sticky context?
        // Or if wrapper is used, wrapper must be sticky.
        // Let's use a wrapper for positioning.

        const wrapperStyle: React.CSSProperties = {
          width: rCol.size,
          height: '100%',
        };

        if (rCol.isPinned) {
          // Position handled inside Cell (or here?)
          // If I handle it here, I don't need to pass props to Cell.
          // Let's handle it HERE to keep Cell simple/dumb.
          // Actually Cell ALREADY has logic. Let's rely on Cell logic for 'sticky' style application needed for CSS properties?
          // But Cell uses `pinnedOffsets`.
          // Wrapper needs to be positioned.
          // If Absolute (Virtual):
          if (typeof rCol.start === 'number') {
            wrapperStyle.position = 'absolute';
            wrapperStyle.transform = `translateX(${rCol.start}px)`;
            wrapperStyle.left = 0;
          } else {
            // It's pinned, but we don't have 'start'.
            // It relies on 'sticky' + 'left/right' inside the Cell?
            // Or we make this wrapper sticky?
            // Let's make the wrapper sticky?
            // But DataGridCell applies sticky.
            // So wrapper should just be 'relative' or transparent?
            // If wrapper is block, and Cell is sticky inside...
            // Sticky works relative to scroll ancestor.
            // So wrapper is fine.
          }
        } else {
          // Virtual
          wrapperStyle.position = 'absolute';
          wrapperStyle.transform = `translateX(${rCol.start}px)`;
          wrapperStyle.left = 0;
        }

        const isFocused = store.getState().focusedCell?.rowIndex === rowIndex && store.getState().focusedCell?.colIndex === rCol.index;

        return (
          <div key={col.id} style={wrapperStyle}>
            <DataGridCell
              value={row[col.id]}
              width={rCol.size}
              column={col}
              row={row}
              rowIndex={rowIndex}
              colIndex={rCol.index}
              isFocused={isFocused}
            />
          </div>
        );
      })}
    </div>
  );
});

DataGridRow.displayName = 'DataGridRow';

export default DataGridRow;