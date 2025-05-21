'use client';

import { Table } from "@/models/Table";
import { TableRow } from "@/models/TableRow";
import ShapeCanvas from "@/components/shape/ShapeCanvas";
import { parseGeneralConfig } from "@/lib/parser/parseShapeConfig";
import { SquareWithTailProps } from "@/components/shape/SquareWithTail";
import { LineShapeProps } from "@/components/shape/Line";
import { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { ShapeConfiguration, ShapeType } from "@/models/ShapeConfiguration";

export default function Label({
  row,
  table,
  canvasRef,
  shapeOptions
}: {
  row: TableRow;
  table: Table;
  canvasRef: (el: HTMLCanvasElement | null) => void;
  shapeOptions: ShapeConfiguration[] | null
}) {
  const renderOblikIMere = () => {
    if (!row.oblikIMere) return null;

    if (row.oblikIMere.startsWith("extracted_shapes")) {
      return (
        <img
          src={`${process.env.NEXT_PUBLIC_FLASK_API ?? ""}${row.oblikIMere}`}
          alt="Oblik i Mere"
          className="max-h-max object-contain mx-auto"
          style={{ maxHeight: '3.5cm', minHeight: '2.5cm', flex: '0 0 auto' }}
        />
      );
    }

    try {
      const shapeType = row.oblikIMere.split(';')[0] as ShapeType;
      const parsed = parseGeneralConfig(row.oblikIMere);

      const squareProps = shapeType === 'SquareWithTail' ? parsed as SquareWithTailProps : {};
      const lineProps = shapeType === 'Line' ? parsed as LineShapeProps : {};
      const connectedProps = shapeType === 'ConnectingLines' ? parsed as ConnectedLinesShapeProps : {};

      return (
        <div className="flex justify-center">
          <ShapeCanvas
            shapeType={shapeType}
            mode="view"
            squareProps={squareProps}
            lineProps={lineProps}
            connectedProps={connectedProps}
            selectedCoords={shapeOptions?.find(s => s.configuration === row.oblikIMere)?.selectedCoords ?? []}
            onToggleCoord={() => {}}
            width={180}
            height={100}
          />
        </div>
      );
    } catch {
      return <div className="text-red-500 text-xs text-center">Invalid Shape</div>;
    }
  };

  return (
    <div
      className="w-[9cm] h-[9cm] p-5 pt-6 pb-4 box-border flex items-center justify-center"
      style={{
        transform: "rotate(90deg)",
        transformOrigin: "center",
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col justify-between w-full h-full">
        {/* POS */}
        <div className="text-center text-xs font-bold" style={{ flex: '0 0 auto' }}>
          POS: <span className="underline">{row.position}</span>
        </div>

        {/* Shape/Image */}
        <div style={{ maxHeight: '3.5cm', minHeight: '2.5cm', flex: '0 0 auto' }}>
          {renderOblikIMere()}
        </div>

        {/* Text Info */}
        <div className="text-xs text-center space-y-1 flex-col justify-center items-center flex" style={{ flex: '1 1 auto', maxHeight: '2.5cm' }}>
          <div>KLIJENT: <span className="font-bold underline">{table.client}</span></div>
          <div>ADRESA: <span className="font-bold underline">{table.address}</span></div>
          <div>GRADILIŠTE: <span className="font-bold underline">{table.job}</span></div>
        </div>

        {/* Barcode */}
        <div style={{ maxHeight: '2cm', flex: '0 0 auto' }} className="flex justify-center">
          <canvas ref={canvasRef} style={{ maxHeight: '2cm' }} />
        </div>

        {/* Dimensions */}
        <div className="flex justify-between text-center font-medium text-lg" style={{ flex: '0 0 auto' }}>
          <div>{row.n ?? "-"} Ø {row.diameter ?? "-"}</div>
          <div>POZ br. {row.ozn}</div>
          <div>Lg: {row.lg ?? "-"}</div>
        </div>
      </div>
    </div>
  );
}
