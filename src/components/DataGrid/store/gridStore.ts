
import { ColumnSchema, SortDirection } from '../DataGrid.types';
import { Store } from './createStore';

export type GridState<T> = {
    data: T[];
    columns: ColumnSchema<T>[];
    sortColumns: { id: string; direction: SortDirection }[];
    columnWidths: Record<string, number>;
    columnOrder: string[];
    hiddenColumns: Set<string>;
    pinnedColumns: {
        left: string[];
        right: string[];
    };
    pinnedOffsets: Record<string, number>; // Maps columnId -> offset value (px)
    scrollLeft: number;
    scrollTop: number;
    focusedCell: { rowIndex: number; colIndex: number } | null;
    announcement: string;
};

const calculatePinnedOffsets = <T>(
    columns: ColumnSchema<T>[],
    pinnedColumns: { left: string[]; right: string[] },
    columnWidths: Record<string, number>
) => {
    const offsets: Record<string, number> = {};

    // Left Pinned: Accumulate width from left
    let currentLeft = 0;
    pinnedColumns.left.forEach((colId) => {
        offsets[colId] = currentLeft;
        currentLeft += (columnWidths[colId] || 100);
    });

    // Right Pinned: Accumulate width from right
    let currentRight = 0;
    [...pinnedColumns.right].reverse().forEach((colId) => {
        offsets[colId] = currentRight;
        currentRight += (columnWidths[colId] || 100);
    });

    return offsets;
};

export const createGridStore = <T>(initialData: T[], initialColumns: ColumnSchema<T>[]) => {
    const pinnedLeft = initialColumns.filter(c => c.pinned === 'left').map(c => c.id);
    const pinnedRight = initialColumns.filter(c => c.pinned === 'right').map(c => c.id);
    const columnWidths = initialColumns.reduce((acc, col) => ({ ...acc, [col.id]: col.width }), {} as Record<string, number>);

    const pinnedOffsets = calculatePinnedOffsets(initialColumns, { left: pinnedLeft, right: pinnedRight }, columnWidths);

    const initialState: GridState<T> = {
        data: initialData,
        columns: initialColumns,
        sortColumns: [],
        columnWidths: columnWidths,
        columnOrder: initialColumns.map(c => c.id),
        hiddenColumns: new Set(),
        pinnedColumns: {
            left: pinnedLeft,
            right: pinnedRight,
        },
        pinnedOffsets,
        scrollLeft: 0,
        scrollTop: 0,
        focusedCell: { rowIndex: 0, colIndex: 0 }, // Initial focus
        announcement: '',
    };

    return new Store<GridState<T>>(initialState);
};

// History stack for Undo
const history: any[] = [];
const pushToHistory = (state: any) => {
    history.push(JSON.parse(JSON.stringify(state))); // Simple deep clone for history
    if (history.length > 50) history.shift(); // Limit history
};

export const gridActions = <T>(store: Store<GridState<T>>) => ({
    undo: () => {
        if (history.length > 0) {
            const prevState = history.pop();
            store.setState(prevState);
        }
    },

    setFocusedCell: (rowIndex: number, colIndex: number) => {
        store.setState((prev) => {
            const dataLen = prev.data.length;
            const colLen = prev.columns.length;

            let targetRow = Math.max(0, Math.min(dataLen - 1, rowIndex));
            let targetCol = Math.max(0, Math.min(colLen - 1, colIndex));

            if (targetRow === prev.focusedCell?.rowIndex && targetCol === prev.focusedCell?.colIndex) {
                return prev;
            }

            return { ...prev, focusedCell: { rowIndex: targetRow, colIndex: targetCol } };
        });
    },

    moveFocusRelative: (rowDelta: number, colDelta: number) => {
        store.setState((prev) => {
            if (!prev.focusedCell) return prev;
            const rowIndex = Math.max(0, Math.min(prev.data.length - 1, prev.focusedCell.rowIndex + rowDelta));
            const colIndex = Math.max(0, Math.min(prev.columns.length - 1, prev.focusedCell.colIndex + colDelta));
            return { ...prev, focusedCell: { rowIndex, colIndex } };
        });
    },

    toggleSort: (columnId: string, multi: boolean) => {
        pushToHistory(store.getState());
        store.setState((prev) => {
            const existingIdx = prev.sortColumns.findIndex(c => c.id === columnId);
            let newSortColumns = multi ? [...prev.sortColumns] : [];

            if (existingIdx >= 0) {
                const current = prev.sortColumns[existingIdx];
                if (current.direction === 'asc') {
                    if (multi) newSortColumns[existingIdx] = { id: columnId, direction: 'desc' };
                    else newSortColumns = [{ id: columnId, direction: 'desc' }];
                } else {
                    if (multi) newSortColumns.splice(existingIdx, 1);
                    else newSortColumns = [];
                }
            } else {
                const newSort = { id: columnId, direction: 'asc' as SortDirection };
                if (multi) newSortColumns.push(newSort);
                else newSortColumns = [newSort];
            }
            const direction = newSortColumns.find(c => c.id === columnId)?.direction;
            const announcement = direction ? `Sorted by ${columnId} ${direction}` : `Removed sort from ${columnId}`;

            return { ...prev, sortColumns: newSortColumns, announcement };
        });
    },

    resizeColumn: (columnId: string, width: number) => {
        store.setState((prev) => {
            const newWidths = { ...prev.columnWidths, [columnId]: width };
            const newOffsets = calculatePinnedOffsets(prev.columns, prev.pinnedColumns, newWidths);
            return {
                ...prev,
                columnWidths: newWidths,
                pinnedOffsets: newOffsets
            };
        });
    },

    commitResize: () => {
        pushToHistory(store.getState());
    },

    hideColumn: (columnId: string) => {
        pushToHistory(store.getState());
        store.setState((prev) => {
            const newHidden = new Set(prev.hiddenColumns);
            newHidden.add(columnId);
            return { ...prev, hiddenColumns: newHidden };
        });
    },

    showColumn: (columnId: string) => {
        pushToHistory(store.getState());
        store.setState((prev) => {
            const newHidden = new Set(prev.hiddenColumns);
            newHidden.delete(columnId);
            return { ...prev, hiddenColumns: newHidden };
        });
    },

    moveColumn: (fromId: string, toId: string) => {
        pushToHistory(store.getState());
        store.setState((prev) => {
            const fromIndex = prev.columnOrder.indexOf(fromId);
            const toIndex = prev.columnOrder.indexOf(toId);
            if (fromIndex === -1 || toIndex === -1) return prev;

            const newOrder = [...prev.columnOrder];
            const [moved] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, moved);

            const newColumns = newOrder.map(id => prev.columns.find(c => c.id === id)!).filter(Boolean);

            return { ...prev, columnOrder: newOrder, columns: newColumns };
        });
    },

    updateCell: async (rowIndex: number, columnId: string, newValue: any, validator?: (val: any, row: any) => Promise<boolean | string>) => {
        const state = store.getState();
        pushToHistory(state);

        const prevData = state.data;

        // 1. Optimistic Update
        store.setState((prev) => {
            const newData = [...prev.data];
            if (newData[rowIndex]) {
                newData[rowIndex] = { ...newData[rowIndex], [columnId]: newValue };
            }
            return { ...prev, data: newData };
        });

        // 2. Async Validation
        if (validator) {
            try {
                const row = state.data[rowIndex];
                const validationResult = await validator(newValue, row);
                if (validationResult !== true) {
                    throw new Error(typeof validationResult === 'string' ? validationResult : 'Validation Failed');
                }
            } catch (error: any) {
                const errorMsg = error.message || 'Validation failed';
                console.error("Validation failed, rolling back", error);
                store.setState((prev) => ({
                    ...prev,
                    data: prevData,
                    announcement: `Error saving cell: ${errorMsg}`
                }));
                history.pop();
            }
        }
    },
});
