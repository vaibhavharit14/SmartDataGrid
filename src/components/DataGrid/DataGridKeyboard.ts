import { KeyboardEvent } from "react";

export function handleGridKeyboard(
  e: KeyboardEvent<HTMLDivElement>,
  focusedCell: { row: number; col: number },
  moveFocus: (dir: "up" | "down" | "left" | "right" | "home" | "end" | "first" | "last" | "pageup" | "pagedown") => void,
  onEdit?: () => void,
  onCancel?: () => void
) {
  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      moveFocus("up");
      break;
    case "ArrowDown":
      e.preventDefault();
      moveFocus("down");
      break;
    case "ArrowLeft":
      e.preventDefault();
      moveFocus("left");
      break;
    case "ArrowRight":
      e.preventDefault();
      moveFocus("right");
      break;
    case "Home":
      e.preventDefault();
      moveFocus(e.ctrlKey ? "first" : "home");
      break;
    case "End":
      e.preventDefault();
      moveFocus(e.ctrlKey ? "last" : "end");
      break;
    case "PageUp":
      e.preventDefault();
      moveFocus("pageup");
      break;
    case "PageDown":
      e.preventDefault();
      moveFocus("pagedown");
      break;
    case "Enter":
      e.preventDefault();
      if (onEdit) onEdit();
      break;
    case "Escape":
      e.preventDefault();
      if (onCancel) onCancel();
      break;
    case "Tab":
      // Grid spec: Tab should focus next focusable element outside grid OR next cell?
      // "Tab: moves focus to the next interactive element in the tab sequence."
      // In a grid, typically Tab moves focus out of the grid.
      break;
    default:
      break;
  }
}