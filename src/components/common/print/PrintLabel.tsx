// src/components/common/print/PrintLabel.tsx
'use client';

import { Table } from '@/models/Table';
import { TableRow } from '@/models/TableRow';
import ShapeCanvas from '@/components/shape/ShapeCanvas';
import { ShapeConfiguration } from '@/models/ShapeConfiguration';
import { useInputRefs } from '@/hooks/useInputRefs';
import { useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import PDF417 from 'pdf417-generator';

export default function PrintLabel({
  row,
  table,
  shapeOptions,
  onReady,
}: {
  row: TableRow;
  table: Table;
  shapeOptions: ShapeConfiguration[] | null;
  onReady: () => void;
}) {
  const isBitmap = row.oblikIMere?.startsWith('extracted_shapes');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const reportedRef = useRef(false); 

  const grouping = useMemo(
    () => [
      {
        position: row.position || 'Unspecified',
        rows: [
          {
            oblikIMere: row.oblikIMere,
            diameter: row.diameter,
            lg: row.lg,
            n: row.n,
            lgn: row.lgn,
            tableId: row.tableId,
            position: row.position,
            ozn: row.ozn,
          },
        ],
        positionIndex: 0,
      },
    ],
    [row]
  );

  const { rowInputs } = useInputRefs(grouping, shapeOptions ?? []);

  const reportReady = useCallback(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReady();
  }, [onReady]);

  const drawBarcode = useCallback(() => {
    if (!canvasRef.current || !row.oblikIMere) return;
    PDF417.draw(row.oblikIMere, canvasRef.current, 3, 3);
  }, [row.oblikIMere]);

  useLayoutEffect(() => {
    if (isBitmap) return;                         // bitmaps handled via <img>

    if (!rowInputs) return;                       // wait for ShapeCanvas

    const tick = () => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        PDF417.draw(row.oblikIMere!, canvasRef.current, 3, 3);
        reportReady();
        return;                                   // done
      }
      requestAnimationFrame(tick);                // try again next frame
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  const handleImg = () => {
    drawBarcode();
    reportReady();
  };

  const renderShape = () => {
    if (!row.oblikIMere) return null;
    if (isBitmap) {
      return (
        <img
          ref={imgRef}
          src={`${process.env.NEXT_PUBLIC_FLASK_API ?? ''}${row.oblikIMere}`}
          alt=""
          className="max-h-max object-contain mx-auto"
          style={{ height: '3.5cm', flex: '0 0 auto' }}
          onLoad={handleImg}
          onError={handleImg}
        />
      );
    }
    return (
      <div className="flex justify-center" style={{ height: '3.5cm', flex: '0 0 auto' }}>
        <ShapeCanvas
          rawConfig={row.oblikIMere}
          mode="input"
          width={250}
          height={130}
          rowIndex={0}
          position={row.position || 'Unspecified'}
          ozn={row.ozn}
          rowInputs={rowInputs}
        />
      </div>
    );
  };

  return (
    <div
      className="w-[9cm] h-[9cm] p-5 pt-6 pb-4 box-border flex items-center justify-center"
      style={{ transform: 'rotate(90deg)', transformOrigin: 'center', overflow: 'hidden' }}
    >
      <div className="flex flex-col justify-between w-full h-full">
        <div className="text-center text-xs font-bold" style={{ flex: '0 0 auto' }}>
          POS: <span className="underline">{row.position}</span>
        </div>
        <div style={{ maxHeight: '3.5cm', minHeight: '2.5cm', flex: '0 0 auto' }}>{renderShape()}</div>
        <div
          className="text-xs text-center space-y-1 flex-col justify-center items-center flex"
          style={{ flex: '1 1 auto', maxHeight: '2.5cm' }}
        >
          <div>
            KLIJENT: <span className="font-bold underline">{table.client}</span>
          </div>
          <div>
            ADRESA: <span className="font-bold underline">{table.address}</span>
          </div>
          <div>
            GRADILIŠTE: <span className="font-bold underline">{table.job}</span>
          </div>
        </div>
        <div className="flex justify-center" style={{ height: '1.5cm', flex: '0 0 auto' }}>
          <canvas ref={canvasRef} style={{ height: '1.5cm' }} />
        </div>
        <div className="flex justify-between text-center font-medium text-lg" style={{ flex: '0 0 auto' }}>
          <div>
            {row.n ?? '-'} Ø {row.diameter ?? '-'}
          </div>
          <div>POZ br. {row.ozn}</div>
          <div>Lg: {row.lg ?? '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
