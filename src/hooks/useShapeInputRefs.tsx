import { useRef } from "react";

export function useShapeInputRefs() {
  const shapeRefs = useRef<Record<number, Record<string, HTMLInputElement | null>>>({});

  const setRef = (row: number, key: string, ref: HTMLInputElement | null) => {
    if (!shapeRefs.current[row]) shapeRefs.current[row] = {};
    shapeRefs.current[row][key] = ref;
  };

  const getRef = (row: number, key: string) =>
    shapeRefs.current[row]?.[key] || null;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ): boolean => {
    const [x, y] = key.split("-").map(Number);

    const dir = {
      ArrowUp: [x, y - 1],
      ArrowDown: [x, y + 1],
      ArrowLeft: [x - 1, y],
      ArrowRight: [x + 1, y],
    }[e.key];

    if (!dir) return false;

    const nextKey = `${dir[0]}-${dir[1]}`;
    const nextRef = shapeRefs.current[row]?.[nextKey];

    if (nextRef) {
      e.preventDefault();
      nextRef.focus();
      return true;
    }

    return false; // no ref found in shape
  };

  return { shapeRefs, setRef, getRef, handleKeyDown };
}
