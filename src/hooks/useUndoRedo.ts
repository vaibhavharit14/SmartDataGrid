import { useState } from "react";

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (newState: T) => {
    const updated = history.slice(0, index + 1);
    updated.push(newState);
    setHistory(updated);
    setIndex(updated.length - 1);
  };

  const undo = () => {
    if (index > 0) setIndex(index - 1);
  };

  const redo = () => {
    if (index < history.length - 1) setIndex(index + 1);
  };

  return { state: history[index], setState, undo, redo };
}