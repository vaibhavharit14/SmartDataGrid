
import React, { useMemo } from "react";
import { useGridStore } from "./store/DataGridContext";
import { useStore } from "./store/createStore";
import { RenderableColumn } from "./InternalDataGrid";
import { gridActions } from "./store/gridStore";

type DataGridHeaderProps = {
  renderableColumns: RenderableColumn[];
};

export const DataGridHeader: React.FC<DataGridHeaderProps> = ({ renderableColumns }) => {
  const store = useGridStore();
  const columns = useStore(store, (s) => s.columns);
  const pinnedOffsets = useStore(store, (s) => s.pinnedOffsets);
  const pinnedColumns = useStore(store, (s) => s.pinnedColumns);
  const sortColumns = useStore(store, (s) => s.sortColumns);

  const actions = useMemo(() => gridActions(store), [store]);

  const handleHeaderClick = (colId: string, event: React.MouseEvent) => {
    const col = columns.find(c => c.id === colId);
    if (col?.sortable !== false) { // Default true if undefined, wait, schema says optional, usually default is sortable
      actions.toggleSort(colId, event.shiftKey || event.ctrlKey || event.metaKey);
    }
  };

  return (
    <>
      {renderableColumns.map((rCol) => {
        const col = columns[rCol.index];
        const isPinnedLeft = pinnedColumns.left.includes(col.id);
        const isPinnedRight = pinnedColumns.right.includes(col.id);

        // Sort Layout
        const sortState = sortColumns.find(s => s.id === col.id);
        const sortIndex = sortColumns.length > 1 ? sortColumns.findIndex(s => s.id === col.id) + 1 : null;

        const style: React.CSSProperties = {
          width: rCol.size,
          height: '100%',
          top: 0,
          zIndex: (isPinnedLeft || isPinnedRight) ? 10 : 1,
        };

        if (!rCol.isPinned && typeof rCol.start === 'number') {
          style.position = 'absolute';
          style.transform = `translateX(${rCol.start}px)`;
          style.left = 0;
        } else {
          style.position = 'sticky';
          if (isPinnedLeft) style.left = pinnedOffsets[col.id];
          if (isPinnedRight) style.right = pinnedOffsets[col.id];
        }

        return (
          <div
            key={col.id}
            role="columnheader"
            aria-sort={sortState ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            className={`flex items-center justify-between px-4 py-3 border-r border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 overflow-hidden whitespace-nowrap box-border select-none group transition-all duration-200 ${sortState ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
            style={style}
            onClick={(e) => handleHeaderClick(col.id, e)}
          >
            <span className={`truncate text-xs font-semibold uppercase tracking-wider ${sortState ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} title={col.title}>
              {col.renderHeader ? col.renderHeader(col) : col.title}
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              {sortState && (
                <span className="flex items-center text-blue-500 dark:text-blue-400 transition-transform duration-300">
                  {sortState.direction === 'asc' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  )}
                  {sortIndex && <span className="ml-0.5 text-[0.6rem] font-bold">{sortIndex}</span>}
                </span>
              )}

              {/* Resize Handle */}
              {col.resizable !== false && (
                <div
                  className="absolute -right-1 top-0 h-full w-3 md:w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 touch-pan-y"
                  style={{ touchAction: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startX = e.pageX;
                    const startWidth = rCol.size;

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const currentX = moveEvent.pageX;
                      const diff = currentX - startX;
                      const newWidth = Math.max(col.minWidth || 50, Math.min(col.maxWidth || 1000, startWidth + diff));
                      actions.resizeColumn(col.id, newWidth);
                    };

                    const onMouseUp = () => {
                      actions.commitResize();
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    const startX = e.touches[0].pageX;
                    const startWidth = rCol.size;

                    const onTouchMove = (moveEvent: TouchEvent) => {
                      const currentX = moveEvent.touches[0].pageX;
                      const diff = currentX - startX;
                      const newWidth = Math.max(col.minWidth || 50, Math.min(col.maxWidth || 1000, startWidth + diff));
                      actions.resizeColumn(col.id, newWidth);
                    };

                    const onTouchEnd = () => {
                      actions.commitResize();
                      window.removeEventListener('touchmove', onTouchMove);
                      window.removeEventListener('touchend', onTouchEnd);
                    };

                    window.addEventListener('touchmove', onTouchMove);
                    window.addEventListener('touchend', onTouchEnd);
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default DataGridHeader;