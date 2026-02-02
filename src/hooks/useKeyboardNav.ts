import { useState } from "react";

export function useKeyboardNav(totalRows: number, totalCols: number) {
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });

  const moveFocus = (direction: "up" | "down" | "left" | "right") => {
    setFocusedCell((prev) => {
      let { row, col } = prev;
      if (direction === "up" && row > 0) row--;
      if (direction === "down" && row < totalRows - 1) row++;
      if (direction === "left" && col > 0) col--;
      if (direction === "right" && col < totalCols - 1) col++;
      return { row, col };
    });
  };

  return { focusedCell, moveFocus };
}