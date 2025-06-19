import { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { LineShapeProps } from "@/components/shape/Line";
import { SquareWithIndependentTailsProps } from "@/components/shape/SquareWithIndependentTails";
import { SquareWithMissingSideProps } from "@/components/shape/SquareWithMissingSide";
import { SquareWithTailProps } from "@/components/shape/SquareWithTail";
import { SquareWithTwoTailProps } from "@/components/shape/SquareWithTwoTail";
import { SquareWithTwoTailDoubleProps } from "@/components/shape/SquareWithTwoTailDouble";

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

export const serializeSquareWithTwoTailConfig = ({  
  width = 100,
  height = 100,
  radius = 10,
  strokeColor = 'theme',
  tail,}: SquareWithTwoTailProps): string => {
  const segments: string[] = [];

  const base = `SquareWithTwoTail;width=${width};height=${height};radius=${radius};stroke=${strokeColor}`;
  if (!tail) return base;
  const tailStr = `tail=${tail.corner}:${tail.side}:${tail.length ?? 12}:${tail.angle ?? 30}`;
  return `${base};${tailStr}`;
};

export const serializeSquareWithTwoTailDoubleConfig = ({
  width = 100,
  height = 100,
  radius = 10,
  strokeColor = 'theme',
  tail,
}: SquareWithTwoTailDoubleProps): string => {
  const base = `SquareWithTwoTailDouble;width=${width};height=${height};radius=${radius};stroke=${strokeColor}`;
  if (!tail) return base;

  const tailStr = `tail=${tail.corner}:${tail.side}:${tail.length ?? 12}:${tail.angle ?? 30}`;
  return `${base};${tailStr}`;
};

export function serializeSquareWithMissingSideConfig(config: SquareWithMissingSideProps): string {
  const { radius = 0, sides = {}, lengths = {} } = config;

  const sideKeys = ['top', 'right', 'bottom', 'left'] as const;
  const sideMap: Record<string, string> = { top: 't', right: 'r', bottom: 'b', left: 'l' };
  const sidesStr = sideKeys
    .filter(k => sides[k])
    .map(k => sideMap[k])
    .join('');

  const lengthsStr = sideKeys
    .filter(k => lengths[k] != null)
    .map(k => `${k}:${lengths[k]}`)
    .join(',');

  return `SquareWithMissingSide;radius=${radius};sides=${sidesStr};lengths=${lengthsStr}`;
}

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

export const serializeSquareWithIndependentTailsConfig = (
  cfg: SquareWithIndependentTailsProps,
): string => {
  const { width=100, height=100, radius=10, strokeColor='theme',
          tails=[], sides={}, lengths={} } = cfg;

  const tailSegs = tails
    .filter(Boolean)
    .map((t,i)=>`tail${i+1}=${t!.corner}:${t!.side}:${t!.length??12}:${t!.angle??30}`)
    .join(';');

  const sideSeg  = Object.entries(sides)
    .filter(([,v])=>v)
    .map(([k])=>k[0])        // t,r,b,l → t,r,b,l
    .join('');
  const lenSeg   = Object.entries(lengths)
    .map(([k,v])=>`${k}:${v}`)
    .join(',');

  return [
    `SquareWithIndependentTails`,
    `width=${width}`, `height=${height}`, `radius=${radius}`, `stroke=${strokeColor}`,
    tailSegs,
    sideSeg && `sides=${sideSeg}`,
    lenSeg  && `lengths=${lenSeg}`,
  ].filter(Boolean).join(';');
};

export const serializeShapeWithInputs = (
  baseConfig: string,
  inputValues: Record<string, number>
): string => {
  const entries = Object.entries(inputValues)
    .filter(([, val]) => !isNaN(val))
    .map(([key, val]) => `${key}:${val}`);

  const cleanBase = baseConfig.split(';inputs=')[0];

  if (entries.length === 0) return baseConfig;

  return `${cleanBase};inputs=${entries.join(',')}`;
};