
import React from "react";
import { DataGridProvider } from "./store/DataGridContext";
import { InternalDataGrid } from "./InternalDataGrid";
import { GridProps } from "./DataGrid.types";

export const DataGrid = <T,>({ data, columns, className, style }: GridProps<T>) => {
  return (
    <DataGridProvider data={data} columns={columns}>
      <div className={`h-full w-full ${className || ''}`} style={style}>
        <InternalDataGrid />
      </div>
    </DataGridProvider>
  );
};

export default DataGrid;