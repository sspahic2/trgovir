/**
 * A single checkbox coordinate on a shape
 */
export interface Coordinate {
  /** Zero‑based side index: 0 = top, 1 = right, 2 = bottom, 3 = left */
  x: number;
  /** Zero‑based position along that side */
  y: number;
}

export type ShapeType = 'SquareWithTail' | 'Line' | 'ConnectingLines';
export type CanvasMode = 'view' | 'edit' | 'input';
/**
 * Represents a saved shape configuration
 */
export interface ShapeConfiguration {
  /** Database ID */
  id: number;
  /** Serialized shape string (e.g. "SquareWithTail;width=100;height=100;…") */
  configuration: string;
  /** Which checkboxes were selected */
  selectedCoords: Coordinate[];
}