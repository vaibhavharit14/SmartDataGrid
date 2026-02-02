
import React, { createContext, useContext, useMemo } from 'react';
import { Store } from './createStore';
import { GridState, createGridStore } from './gridStore';
import { ColumnSchema } from '../DataGrid.types';

const DataGridContext = createContext<Store<GridState<any>> | null>(null);

type DataGridProviderProps<T> = {
    data: T[];
    columns: ColumnSchema<T>[];
    children: React.ReactNode;
};

export const DataGridProvider = <T,>({ data, columns, children }: DataGridProviderProps<T>) => {
    // Re-create store only if data ref changes (or we could use useEffect to update store)
    // For now, let's assume mutable ref pattern or simple instantiation
    const store = useMemo(() => createGridStore(data, columns), [data, columns]); // Warning: deep comparison or ref check needed for real apps, but adequate for assignment if data is stable-ish

    return React.createElement(DataGridContext.Provider, { value: store }, children);
};

export const useGridStore = <T,>() => {
    const store = useContext(DataGridContext);
    if (!store) {
        throw new Error("useGridStore must be used within a DataGridProvider");
    }
    return store as Store<GridState<T>>;
};
