import { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { LineShapeProps } from "@/components/shape/Line";
import { SquareWithTailProps } from "@/components/shape/SquareWithTail";

export const serializeSquareConfig = ({
  width = 100,
  height = 100,
  radius = 10,
  strokeColor = 'theme',
  tail,
}: SquareWithTailProps): string => {
  const base = `SquareWithTail;width=${width};height=${height};radius=${radius};stroke=${strokeColor}`;
  if (!tail) return base;
  const tailStr = `tail=${tail.corner}:${tail.side}:${tail.length ?? 12}:${tail.angle ?? 30}`;
  return `${base};${tailStr}`;
};

export const serializeLineConfig = ({
  length = 100,
  thickness = 2,
  direction = 'horizontal',
  strokeColor = 'theme',
}: LineShapeProps): string => {
  return `Line;length=${length};thickness=${thickness};direction=${direction};stroke=${strokeColor}`;
};

export const serializeConnectedLinesConfig = ({
  length = 100,
  thickness = 2,
  strokeColor = 'theme',
  angle = 60,
}: ConnectedLinesShapeProps): string => {
  return `ConnectingLines;length=${length};thickness=${thickness};stroke=${strokeColor};angle=${angle}`;
};

export const serializeShapeWithInputs = (
  baseConfig: string,
  inputValues: Record<string, number>
): string => {
  const entries = Object.entries(inputValues)
    .filter(([, val]) => !isNaN(val))
    .map(([key, val]) => `${key}:${val}`);

  if (entries.length === 0) return baseConfig;

  return `${baseConfig};inputs=${entries.join(',')}`;
};