'use client';

import PrettySidebar from '@/components/common/sidebar/PrettySidebar';
import React, { JSX, useEffect, useMemo, useState } from 'react';

type Point = { row: number; col: number };
type Line = { from: Point; to: Point };
type CurvedCorner = { point: Point; from: Point; to: Point };

const gridPoints = 32;
const pointRadius = 4;
const hoverRadius = 6;
const padding = 16;
const navHeight = 45;
const inset = 1;

function pointKey(p: Point) {
  return `${p.row}-${p.col}`;
}
function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col;
}

function movePoint(p: Point, dx: number, dy: number): Point {
  return { row: p.row + dy, col: p.col + dx };
}

export default function ShapeEditorPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [curves, setCurves] = useState<CurvedCorner[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 100, height: 100 });


    useEffect(() => {
      const measure = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setCanvasSize({ width: rect.width, height: rect.height });
        }
      };

      measure(); // initial call

      const observer = new ResizeObserver(measure);
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, []);

  function renderShapeToSvg(serialized: string, size: number = 128): string {
    const parsed = JSON.parse(serialized);
    const cellWidth = size / (gridPoints * 2 - 1);
    const cellHeight = size / (gridPoints - 1);

    const toSvgCoord = (p: Point) => [
      p.col * cellWidth,
      p.row * cellHeight,
    ];

    const svgLines = (parsed.lines || []).map((line: Line) => {
      const [x1, y1] = toSvgCoord(line.from);
      const [x2, y2] = toSvgCoord(line.to);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="cyan" stroke-width="2"/>`;
    });

    const svgCurves = (parsed.curves || []).map((curve: CurvedCorner) => {
      const [x1, y1] = toSvgCoord(curve.from);
      const [x2, y2] = toSvgCoord(curve.point);
      const [x3, y3] = toSvgCoord(curve.to);
      return `<path d="M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3}" stroke="cyan" stroke-width="4" fill="none"/>`;
    });

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${svgLines.join('\n  ')}
      ${svgCurves.join('\n  ')}
    </svg>
    `.trim();
  }

  function serializeShape() {
    return JSON.stringify({
      lines,
      curves,
      activePoint,
    });
  }

  function is90DegreeAngle(a: Point, center: Point, b: Point): boolean {
    const v1 = { x: a.col - center.col, y: a.row - center.row };
    const v2 = { x: b.col - center.col, y: b.row - center.row };

    const dot = v1.x * v2.x + v1.y * v2.y;
    return dot === 0;
  }

  const drawingWidth = canvasSize.width - padding * 2;
  const drawingHeight = canvasSize.height - padding * 2;
  const cellWidth = drawingWidth / (gridPoints * 2 - 1);
  const cellHeight = drawingHeight / (gridPoints * 2 - 1);


  function toPx(p: Point): [number, number] {
    return [padding + p.col * cellWidth, padding + p.row * cellHeight];
  }

  function getMousePoint(e: React.MouseEvent<SVGSVGElement>): Point | null {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left - padding;
    const y = e.clientY - rect.top - padding;

    const col = Math.round(x / cellWidth);
    const row = Math.round(y / cellHeight);

    if (row < 0 || row >= gridPoints || col < 0 || col >= gridPoints * 2) return null;

    const px = col * cellWidth;
    const py = row * cellHeight;
    const dist = Math.hypot(px - x, py - y);

    return dist <= hoverRadius ? { row, col } : null;
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    setHoverPoint(getMousePoint(e));
  };

  const deleteRadius = Math.min(cellWidth, cellHeight) * 0.35;
  const deleteFontSize = deleteRadius * 0.9;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = getMousePoint(e);
    if (!p) {
      setActivePoint(null);
      return;
    }

    const touchingLines = lines.filter(
      l => samePoint(l.from, p) || samePoint(l.to, p)
    );

    // Try all pairs of touching lines
    for (let i = 0; i < touchingLines.length; i++) {
      for (let j = i + 1; j < touchingLines.length; j++) {
        const l1 = touchingLines[i];
        const l2 = touchingLines[j];

        const other1 = samePoint(l1.from, p) ? l1.to : l1.from;
        const other2 = samePoint(l2.from, p) ? l2.to : l2.from;

        if (is90DegreeAngle(other1, p, other2)) {
          // Avoid duplicate curves
          if (curves.some(c => samePoint(c.point, p))) return;

          const newLines = lines.filter(l => l !== l1 && l !== l2);

          const adjusted1 = other1.col === p.col
            ? movePoint(p, 0, p.row > other1.row ? -inset : inset)
            : movePoint(p, p.col > other1.col ? -inset : inset, 0);

          const adjusted2 = other2.col === p.col
            ? movePoint(p, 0, p.row > other2.row ? -inset : inset)
            : movePoint(p, p.col > other2.col ? -inset : inset, 0);

          newLines.push({ from: other1, to: adjusted1 });
          newLines.push({ from: other2, to: adjusted2 });

          setLines(newLines);
          setCurves(prev => [...prev, { point: p, from: adjusted1, to: adjusted2 }]);
          return;
        }
      }
    }


    if (!activePoint) {
      setActivePoint(p);
    } else if (!samePoint(p, activePoint)) {
      const exists = lines.some(
        l =>
          (samePoint(l.from, activePoint) && samePoint(l.to, p)) ||
          (samePoint(l.from, p) && samePoint(l.to, activePoint))
      );

      if (!exists) {
        setLines(prev => [...prev, { from: activePoint, to: p }]);
      }

      setActivePoint(null);
    }
  };
  const deleteButtons: JSX.Element[] = [];


  const pointElements = useMemo(() => {
    const highlighted = new Set<string>();
    for (const line of lines) {
      highlighted.add(pointKey(line.from));
      highlighted.add(pointKey(line.to));
    }
    for (const curve of curves) {
      highlighted.add(pointKey(curve.point));
      highlighted.add(pointKey(curve.from));
      highlighted.add(pointKey(curve.to));
    }

    const elements: JSX.Element[] = [];
    for (let row = 0; row < gridPoints; row++) {
      for (let col = 0; col < gridPoints * 2; col++) {
        const pt = { row, col };
        const [cx, cy] = toPx(pt);
        const key = pointKey(pt);
        const isHighlighted = highlighted.has(key);

        elements.push(
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={pointRadius}
            fill={isHighlighted ? '#bbb' : '#111'}
          />
        );
      }
    }
    return elements;
  }, [cellWidth, cellHeight, lines, curves]);

  const pathElements: JSX.Element[] = [];
  for (const line of lines) {
    const [x1, y1] = toPx(line.from);
    const [x2, y2] = toPx(line.to);
    const key = `line-${pointKey(line.from)}-${pointKey(line.to)}`;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    pathElements.push(
      <line
        key={key}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="cyan"
        strokeWidth={2}
      />
    );

    deleteButtons.push(
      <g
        key={`delete-${key}`}
        className="hover:opacity-100 opacity-0 transition-opacity duration-150 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setLines(prev => prev.filter(
            l =>
              !(samePoint(l.from, line.from) && samePoint(l.to, line.to)) &&
              !(samePoint(l.from, line.to) && samePoint(l.to, line.from))
          ));
        }}
      >
        <circle cx={midX} cy={midY} r={deleteRadius} fill="black" />
        <text
          x={midX}
          y={midY + deleteFontSize * 0.35}
          textAnchor="middle"
          fontSize={deleteFontSize}
          fill="red"
          fontWeight="bold"
          pointerEvents="none"
        >
          x
        </text>
      </g>
    );
  }

  for (const { point, from, to } of curves) {
    const [x1, y1] = toPx(from);
    const [x2, y2] = toPx(point);
    const [x3, y3] = toPx(to);

    pathElements.push(
      <path
        key={`curve-${pointKey(point)}`}
        d={`M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3}`}
        stroke="cyan"
        strokeWidth={4}
        fill="none"
      />
    );

    const midX = (from.col + to.col) / 2;
    const midY = (from.row + to.row) / 2;
    const [cx, cy] = toPx({ row: midY, col: midX });
    const key = `curve-${pointKey(point)}`;

    deleteButtons.push(
      <g
        key={`delete-${key}`}
        className="hover:opacity-100 opacity-0 transition-opacity duration-150 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setCurves(prev => prev.filter(
            c => pointKey(c.point) !== pointKey(point)
          ));
        }}
      >
      <circle cx={midX} cy={midY} r={deleteRadius} fill="black" />
      <text
        x={midX}
        y={midY + deleteFontSize * 0.35}
        textAnchor="middle"
        fontSize={deleteFontSize}
        fill="red"
        fontWeight="bold"
        pointerEvents="none"
      >
        x
      </text>
      </g>
    );
  }

  const previewLine =
    activePoint && hoverPoint && !samePoint(activePoint, hoverPoint) ? (
      <line
        x1={toPx(activePoint)[0]}
        y1={toPx(activePoint)[1]}
        x2={toPx(hoverPoint)[0]}
        y2={toPx(hoverPoint)[1]}
        stroke="gray"
        strokeWidth={2}
        strokeDasharray="6,3"
      />
    ) : null;

  const hoverCircle = hoverPoint ? (
    <circle
      cx={toPx(hoverPoint)[0]}
      cy={toPx(hoverPoint)[1]}
      r={hoverRadius}
      fill="#00ffff"
    />
  ) : null;

if (canvasSize.width === 0 || canvasSize.height === 0) {
  return null;
}
    return (
      <div className="flex w-screen h-screen overflow-hidden">
        <div       
          ref={containerRef}
          className="flex-1 h-full"
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            className="cursor-crosshair bg-black"
          >
            {pointElements}
            {previewLine}
            {pathElements}
            {hoverCircle}
            {deleteButtons}
          </svg>
        </div>

        <PrettySidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(prev => !prev)} className='bg-black'>
          <div
            className="w-full flex justify-center items-center bg-black"
            dangerouslySetInnerHTML={{ __html: renderShapeToSvg(serializeShape(), 300) }}
          />
        </PrettySidebar>
      </div>
    );

}
