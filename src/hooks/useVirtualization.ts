import { useState, useEffect } from "react";

export function useVirtualization(totalRows: number, rowHeight: number, viewportHeight: number) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  useEffect(() => {
    const visibleCount = Math.ceil(viewportHeight / rowHeight);
    setEndIndex(startIndex + visibleCount);
  }, [startIndex, rowHeight, viewportHeight]);

  const handleScroll = (scrollTop: number) => {
    const newStart = Math.floor(scrollTop / rowHeight);
    setStartIndex(newStart);
  };

  return { startIndex, endIndex, handleScroll };
}