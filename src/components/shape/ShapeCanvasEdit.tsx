import { Coordinate } from "@/models/ShapeConfiguration";

interface ShapeCanvasEditProps {
  ShapeComponent: React.FC<any>;
  shapeProps: any;
  width: number;
  height: number;
  slots: { x: number; y: number }[];
  getOffset: (slot: { x: number; y: number }) => { x: number; y: number };
  selectedCoords: Coordinate[];
  onToggleCoord: (coord: Coordinate) => void;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function ShapeCanvasEdit({
  ShapeComponent,
  shapeProps,
  width,
  height,
  slots,
  getOffset,
  selectedCoords,
  onToggleCoord,
  offsetX,
  offsetY,
  scale
}: ShapeCanvasEditProps) {
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Center and scale the shape */}
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          <ShapeComponent {...shapeProps} />
        </g>

        {/* Draw red "×" for each selected coord or clickable area in edit mode */}
        {slots.map((slot) => {
          const { x, y } = getOffset(slot);
          const isSel = selectedCoords.some(
            (sc) => sc.x === slot.x && sc.y === slot.y
          );
          
          return (
            <g
              key={`${slot.x}-${slot.y}`}
              onClick={() => onToggleCoord(slot)}
              className="cursor-pointer"
            >
              <rect
                x={x - 7}
                y={y - 7}
                width={14}
                height={14}
                fill="transparent"
                stroke={isSel ? 'red' : 'gray'}
                strokeWidth={1}
              />
              {isSel && (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="red"
                  fontSize={14}
                >
                  x
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
