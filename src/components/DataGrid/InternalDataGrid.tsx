
import React, { useRef, useState, useLayoutEffect, useCallback, useMemo } from "react";
import { useGridStore } from "./store/DataGridContext";
import { useStore } from "./store/createStore";
import { useVirtualizer } from "./hooks/useVirtualizer";
import DataGridRow from "./DataGridRow";
import DataGridHeader from "./DataGridHeader";
import { handleGridKeyboard } from "./DataGridKeyboard";
import { gridActions } from "./store/gridStore";

const SCROLLBAR_WIDTH = 17;

export type RenderableColumn = {
    index: number;
    id: string;
    isPinned: boolean;
    start?: number; // Only for virtual items
    size: number;
};

export const InternalDataGrid: React.FC = () => {
    const store = useGridStore();
    const data = useStore(store, (s) => s.data);
    const columns = useStore(store, (s) => s.columns);
    const columnWidths = useStore(store, (s) => s.columnWidths);
    const pinnedColumns = useStore(store, (s) => s.pinnedColumns);
    const sortColumns = useStore(store, (s) => s.sortColumns);
    const hiddenColumns = useStore(store, (s) => s.hiddenColumns);

    const visibleColumns = useMemo(() =>
        columns.filter(c => !hiddenColumns.has(c.id)),
        [columns, hiddenColumns]);

    // Sorting Logic
    const sortedData = useMemo(() => {
        if (!sortColumns.length) return data;

        return [...data].sort((a: any, b: any) => {
            for (const sort of sortColumns) {
                const valA = a[sort.id];
                const valB = b[sort.id];
                const dir = sort.direction === 'asc' ? 1 : -1;

                if (valA === valB) continue;

                if (valA === null || valA === undefined) return 1; // Nulls last
                if (valB === null || valB === undefined) return -1;

                if (typeof valA === 'string' && typeof valB === 'string') {
                    const comparison = valA.localeCompare(valB);
                    if (comparison !== 0) return comparison * dir;
                } else {
                    if (valA > valB) return 1 * dir;
                    if (valA < valB) return -1 * dir;
                }
            }
            return 0;
        });
    }, [data, sortColumns]);

    const parentRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // State for scroll handling
    const [scrollState, setScrollState] = useState({ scrollTop: 0, scrollLeft: 0, containerHeight: 600, containerWidth: 800 });

    useLayoutEffect(() => {
        if (!parentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { clientHeight, clientWidth } = entry.target;
                setScrollState(prev => ({
                    ...prev,
                    containerHeight: clientHeight,
                    containerWidth: clientWidth
                }));
            }
        });

        observer.observe(parentRef.current);
        return () => observer.disconnect();
    }, []);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollLeft } = e.currentTarget;

        if (headerRef.current) {
            headerRef.current.scrollLeft = scrollLeft;
        }

        setScrollState(prev => ({ ...prev, scrollTop, scrollLeft }));
        store.setState({ scrollLeft, scrollTop });
    }, [store]);

    // Row Virtualization
    const rowVirtualizer = useVirtualizer({
        count: sortedData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35, // Fixed row height
        overscan: 5,
        scrollOffset: scrollState.scrollTop,
        containerSize: scrollState.containerHeight,
    });

    // Column Virtualization
    const columnVirtualizer = useVirtualizer({
        count: visibleColumns.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => columnWidths[visibleColumns[index].id] || visibleColumns[index].width,
        overscan: 2,
        scrollOffset: scrollState.scrollLeft,
        containerSize: scrollState.containerWidth
    });

    const totalWidth = columnVirtualizer.totalSize;

    // Prepare Renderable Columns (Merge Pinned + Virtual)
    const renderableColumns = useMemo(() => {
        const result: RenderableColumn[] = [];
        const seen = new Set<string>();

        // 1. Pinned Left
        pinnedColumns.left.forEach(id => {
            if (hiddenColumns.has(id)) return;
            const index = visibleColumns.findIndex(c => c.id === id);
            if (index !== -1) {
                result.push({ index, id, isPinned: true, size: columnWidths[id] });
                seen.add(id);
            }
        });

        // 2. Virtual Window (Filter out already pinned)
        columnVirtualizer.virtualItems.forEach(vCol => {
            const col = visibleColumns[vCol.index];
            if (!seen.has(col.id)) {
                if (!pinnedColumns.left.includes(col.id) && !pinnedColumns.right.includes(col.id)) {
                    result.push({
                        index: vCol.index,
                        id: col.id,
                        isPinned: false,
                        start: vCol.start,
                        size: vCol.size
                    });
                }
            }
        });

        // 3. Pinned Right
        pinnedColumns.right.forEach(id => {
            if (hiddenColumns.has(id)) return;
            const index = visibleColumns.findIndex(c => c.id === id);
            if (index !== -1) {
                result.push({ index, id, isPinned: true, size: columnWidths[id] });
            }
        });

        return result;

    }, [pinnedColumns, visibleColumns, columnVirtualizer.virtualItems, columnWidths, hiddenColumns]);


    // Focus State
    const focusedCell = useStore(store, (s) => s.focusedCell);
    const actions = useMemo(() => gridActions(store), [store]);

    // Scroll to focused cell
    useLayoutEffect(() => {
        if (focusedCell && parentRef.current) {
            // Simple ScrollIntoView logic
            // Row scroll
            const rowTop = rowVirtualizer.virtualItems.find(v => v.index === focusedCell.rowIndex)?.start;
            // If row is not virtualized (too far), we need to estimate.
            // With fixed size, estimation is rowIndex * 35.
            const estimatedRowTop = focusedCell.rowIndex * 35; // default size

            const { scrollTop, containerHeight } = scrollState;
            if (estimatedRowTop < scrollTop) {
                parentRef.current.scrollTop = estimatedRowTop;
            } else if (estimatedRowTop + 35 > scrollTop + containerHeight) {
                parentRef.current.scrollTop = estimatedRowTop + 35 - containerHeight;
            }

            // Column scroll
            // Need accurate column offset.
            // Using logic from pinnedOffsets? No, focused cell is likely in scrollable area.
            // We need to look up column offset in `columnWidths` summation? Expense.
            // MVP: minimal scrolling for rows first.
        }
    }, [focusedCell, scrollState.containerHeight]); // CAREFUL: this might conflict with scrollState updates.
    // Better: Only trigger if focusedCell CHANGED.

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!focusedCell) return;

        handleGridKeyboard(
            e as React.KeyboardEvent<HTMLDivElement>,
            { row: focusedCell.rowIndex, col: focusedCell.colIndex },
            (dir: "up" | "down" | "left" | "right" | "home" | "end" | "first" | "last" | "pageup" | "pagedown") => {
                let { rowIndex, colIndex } = focusedCell;
                const dataLen = sortedData.length;
                const colLen = columns.length;
                const pageSize = Math.floor(scrollState.containerHeight / 35) || 10;

                switch (dir) {
                    case 'up': rowIndex = Math.max(0, rowIndex - 1); break;
                    case 'down': rowIndex = Math.min(dataLen - 1, rowIndex + 1); break;
                    case 'left': colIndex = Math.max(0, colIndex - 1); break;
                    case 'right': colIndex = Math.min(colLen - 1, colIndex + 1); break;
                    case 'home': colIndex = 0; break;
                    case 'end': colIndex = colLen - 1; break;
                    case 'first': rowIndex = 0; colIndex = 0; break;
                    case 'last': rowIndex = dataLen - 1; colIndex = colLen - 1; break;
                    case 'pageup': rowIndex = Math.max(0, rowIndex - pageSize); break;
                    case 'pagedown': rowIndex = Math.min(dataLen - 1, rowIndex + pageSize); break;
                }

                actions.setFocusedCell(rowIndex, colIndex);
            },
            () => {
                // onEdit
            },
            () => {
                // onCancel
            }
        );

        // Undo handling
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            actions.undo();
        }
    };

    const announcement = useStore(store, (s) => s.announcement);

    return (
        <div
            role="grid"
            aria-rowcount={sortedData.length + 1}
            aria-colcount={columns.length}
            aria-label="Data Grid"
            className="relative flex h-full flex-col border border-gray-200 dark:border-gray-800 outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Accessibility Announcements */}
            <div className="sr-only" aria-live="polite" role="status">
                {announcement}
            </div>
            {/* Header Container */}
            <div
                ref={headerRef}
                className="overflow-hidden border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-zinc-900 scrollbar-hide"
                style={{ width: '100%', overflowX: 'auto' }}
            >
                <div style={{ position: 'relative', width: totalWidth, height: 40, display: 'flex' }}>
                    <DataGridHeader renderableColumns={renderableColumns} />
                </div>
            </div>

            {/* Main Scrollable Body */}
            <div
                ref={parentRef}
                className="flex-1 overflow-auto outline-none bg-white dark:bg-black"
                onScroll={handleScroll}
                style={{ width: '100%', height: '100%' }}
            >
                <div style={{
                    height: `${rowVirtualizer.totalSize}px`,
                    width: `${totalWidth}px`,
                    position: "relative",
                    minWidth: '100%' // Ensure it stretches if columns are few
                }}>
                    {rowVirtualizer.virtualItems.map((virtualRow) => {
                        const row = sortedData[virtualRow.index];
                        return (
                            <DataGridRow
                                key={virtualRow.index}
                                rowIndex={virtualRow.index}
                                dataRowCount={sortedData.length}
                                row={row}
                                renderableColumns={renderableColumns}
                                style={{
                                    position: 'absolute',
                                    top: virtualRow.start,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transition: 'background-color 0.2s ease', // Smooth hover
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
