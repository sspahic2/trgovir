import { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { LineShapeProps, LineDirection } from "@/components/shape/Line";
import { DualTailConfig, SquareWithIndependentTailsProps } from "@/components/shape/SquareWithIndependentTails";
import { SquareWithMissingSideProps } from "@/components/shape/SquareWithMissingSide";
import { Corner, Side, SquareWithTailProps } from "@/components/shape/SquareWithTail";
import { SquareWithTwoTailProps } from "@/components/shape/SquareWithTwoTail";
import { SquareWithTwoTailDoubleProps } from "@/components/shape/SquareWithTwoTailDouble";

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

  export const parseSquareWithTwoTailConfig = (str: string): SquareWithTwoTailProps => {
    const parts = str.split(';');
    const result: SquareWithTwoTailProps = {};

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

  
export const parseSquareWithTwoTailDoubleConfig = (str: string): SquareWithTwoTailDoubleProps => {
  const parts = str.split(';');
  const result: SquareWithTwoTailDoubleProps = {};

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

export function parseSquareWithMissingSideConfig(input: string): SquareWithMissingSideProps | "Invalid" {
  try {
    const parts = input.split(';');
    if (parts[0] !== 'SquareWithMissingSide') return 'Invalid';

    const config: SquareWithMissingSideProps = {
      radius: 0,
      sides: {},
      lengths: {},
    };

    for (let i = 1; i < parts.length; i++) {
      const [key, val] = parts[i].split('=');
      if (key === 'radius') {
        config.radius = parseFloat(val);
      } else if (key === 'sides') {
        const sideFlags = { t: 'top', r: 'right', b: 'bottom', l: 'left' } as const;
        type Flag = keyof typeof sideFlags;
        for (const c of val) {
          const side = sideFlags[c as Flag];
          if (side) config.sides![side] = true;
        }
      } else if (key === 'lengths') {
        const segments = val.split(',');
        for (const segment of segments) {
          const [k, v] = segment.split(':');
          if (['top', 'right', 'bottom', 'left'].includes(k)) {
            config.lengths![k as keyof typeof config.lengths] = parseFloat(v);
          }
        }
      }
    }

    return config;
  } catch {
    return 'Invalid';
  }
}

export const parseSquareWithIndependentTailsConfig = (
  str: string,
): SquareWithIndependentTailsProps => {
  const parts = str.split(";");
  const result: SquareWithIndependentTailsProps = {
    tails: [],
    sides: {},
    lengths: {} as Partial<Record<"top" | "right" | "bottom" | "left", number>>,
  };

  for (const part of parts) {
    if (part.startsWith("width=")) {
      result.width = parseFloat(part.split("=")[1]);
    } else if (part.startsWith("height=")) {
      result.height = parseFloat(part.split("=")[1]);
    } else if (part.startsWith("radius=")) {
      result.radius = parseFloat(part.split("=")[1]);
    } else if (part.startsWith("stroke=")) {
      result.strokeColor = part.split("=")[1];
    }

    // ───── tails ─────
    else if (part.startsWith("tail1=") || part.startsWith("tail2=")) {
      const idx = part.startsWith("tail1=") ? 0 : 1;
      const [, value] = part.split("=");
      const [corner, side, lengthStr, angleStr] = value.split(":");
      (result.tails as [DualTailConfig?, DualTailConfig?])[idx] = {
        corner: corner as Corner,
        side: side as Side,
        length: parseFloat(lengthStr),
        angle: parseFloat(angleStr),
      };
    }

    // ───── visible sides ─────
    else if (part.startsWith("sides=")) {
      const flags = part.split("=")[1];
      const map = { t: "top", r: "right", b: "bottom", l: "left" } as const;
      for (const c of flags) {
        const k = map[c as keyof typeof map];
        if (k) result.sides![k] = true;
      }
    }

    // ───── per-side lengths ─────
    else if (part.startsWith("lengths=")) {
      const segs = part.split("=")[1].split(",");
      for (const seg of segs) {
        const [k, v] = seg.split(":");
        if (["top", "right", "bottom", "left"].includes(k)) {
          result.lengths![k as keyof typeof result.lengths] = parseFloat(v);
        }
      }
    }
  }

  // 🔹 Fallback lengths so ShapeCanvas never crashes
  result.lengths = {
    top: result.lengths!.top ?? result.width ?? 100,
    right: result.lengths!.right ?? result.height ?? 100,
    bottom: result.lengths!.bottom ?? result.width ?? 100,
    left: result.lengths!.left ?? result.height ?? 100,
  };

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
    case "SquareWithTwoTail":
      return parseSquareWithTwoTailConfig(str);
    case "SquareWithTwoTailDouble":
      return parseSquareWithTwoTailDoubleConfig(str);
    case "SquareWithMissingSide":
      return parseSquareWithMissingSideConfig(str);
    case "SquareWithIndependentTails":
      return parseSquareWithIndependentTailsConfig(str);
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