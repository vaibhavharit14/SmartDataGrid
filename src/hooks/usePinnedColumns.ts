import { useState } from "react";

export function usePinnedColumns(initialPinned: number[] = []) {
  const [pinnedCols, setPinnedCols] = useState(initialPinned);

  const pinColumn = (colIndex: number) => {
    if (!pinnedCols.includes(colIndex)) {
      setPinnedCols([...pinnedCols, colIndex]);
    }
  };

  const unpinColumn = (colIndex: number) => {
    setPinnedCols(pinnedCols.filter((c) => c !== colIndex));
  };

  return { pinnedCols, pinColumn, unpinColumn };
}