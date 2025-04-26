import { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { LineShapeProps, LineDirection } from "@/components/shape/Line";
import { Corner, Side, SquareWithTailProps } from "@/components/shape/SquareWithTail";

export const parseSquareConfig = (str: string): SquareWithTailProps => {
  const parts = str.split(';');
  const result: SquareWithTailProps = {};

  for (const part of parts) {
    if (part.startsWith('width=')) {
      result.width = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('height=')) {
      result.height = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('radius=')) {
      result.radius = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('stroke=')) {
      result.strokeColor = part.split('=')[1];
    } else if (part.startsWith('tail=')) {
      const [, value] = part.split('=');
      const [corner, side, lengthStr, angleStr] = value.split(':');
      result.tail = {
        corner: corner as Corner,
        side: side as Side,
        length: parseFloat(lengthStr),
        angle: parseFloat(angleStr),
      };
    }
  }

  return result;
};

export const parseLineConfig = (str: string): LineShapeProps => {
  const parts = str.split(';');
  const result: LineShapeProps = {};

  for (const part of parts) {
    if (part.startsWith('length=')) {
      result.length = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('thickness=')) {
      result.thickness = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('direction=')) {
      result.direction = part.split('=')[1] as LineDirection;
    } else if (part.startsWith('stroke=')) {
      result.strokeColor = part.split('=')[1];
    }
  }

  return result;
};

export const parseConnectedLinesConfig = (str: string): ConnectedLinesShapeProps => {
  const parts = str.split(';');
  const result: ConnectedLinesShapeProps = {};

  for (const part of parts) {
    if (part.startsWith('length=')) {
      result.length = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('thickness=')) {
      result.thickness = parseFloat(part.split('=')[1]);
    } else if (part.startsWith('stroke=')) {
      result.strokeColor = part.split('=')[1];
    } else if (part.startsWith('angle=')) {
      result.angle = parseFloat(part.split('=')[1]);
    }
  }

  return result;
};

export const parseGeneralConfig = (str: string) => {
  const parts = str.split(';');

  if(parts.length <= 0) return "Invalid";

  const shape = parts[0];

  switch(shape) {
    case "SquareWithTail":
      return parseSquareConfig(str);  
    case "Line":
      return parseLineConfig(str);
    case "ConnectingLines":
      return parseConnectedLinesConfig(str);
    default:
      return "Invalid";
  }
}

export const parseInputValues = (configStr: string): Record<string, number> => {
  const inputsPart = configStr.split(";").find(p => p.startsWith("inputs="));
  if (!inputsPart) return {};

  const raw = inputsPart.slice("inputs=".length);
  const entries = raw.split(",").map(pair => {
    const [key, val] = pair.split(":");
    return [key, parseFloat(val)];
  });

  return Object.fromEntries(entries);
};