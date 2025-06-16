// src/app/table/print/[id]/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PDF417 from 'pdf417-generator';
import { TableService } from '@/services/table.service';
import { ConfigurationService } from '@/services/configuration.service';
import { Table } from '@/models/Table';
import { TableRow } from '@/models/TableRow';
import { ShapeConfiguration } from '@/models/ShapeConfiguration';
import Label from '@/components/common/print/PrintLabel';
import PrintTable from '@/components/common/print/PrintTable';
import { usePrintStyles } from '@/hooks/usePrintStyles';
import '@/css/print.css';
import PrettyButton from '@/components/common/button/PrettyButton';

/*
 * Single‑responsibility: this page orchestrates data‑fetch + decides when to
 * call window.print().  The logic is:
 *   1. Fetch table + shapeOptions.
 *   2. Render <Label> for every row.
 *   3. Each <Label> calls onReady() **exactly once** when its visual is ready.
 *   4. When onReady() has been called table.rows.length times → print.
 */

export default function PrintableLabels() {
  // ─────────────────────────────────────────────── Layout selection
  const params = useParams();
  const searchParams = useSearchParams();
  const layout = searchParams.get('layout') ?? 'single';
  usePrintStyles(layout);

  // ─────────────────────────────────────────────── Local state
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);
  const [table, setTable] = useState<(Table & { rows: TableRow[] }) | null>(null);
  const [readyCount, setReadyCount] = useState(0); // purely for debug/UI

  // refs avoid stale closures / re‑renders during rapid load events
  const totalRowsRef = useRef(0);
  const readyRef = useRef(0);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // ─────────────────────────────────────────────── Fetch data
  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) return;

    TableService.getTableWithRows(id).then((res) => {
      let rows = [...res.rows].sort((a, b) => {
        if (a.diameter == null) return 1;
        if (b.diameter == null) return -1;
        return a.diameter - b.diameter;
      });

      if (layout === 'grid') {
        const grouped: Record<string, typeof rows> = {};
        rows.forEach((row) => {
          const key = row.diameter?.toString() ?? 'null';
          (grouped[key] ||= []).push(row);
        });
        rows = Object.values(grouped).flat();
      }

      totalRowsRef.current = rows.length; // for print‑gate logic
      readyRef.current = 0;               // reset counter
      setReadyCount(0);                   // debug mirror
      setTable({ ...res, rows });
    });

    ConfigurationService.getAll().then(setShapeOptions);
  }, [params.id, layout]);

  // ─────────────────────────────────────────────── Label callback
  const handleLabelReady = useCallback(() => {
    readyRef.current += 1;
    setReadyCount(readyRef.current);
    if (readyRef.current === totalRowsRef.current && table) {
      // Next frame → guaranteed paint complete
      requestAnimationFrame(() => window.print());
    }
  }, [table, layout]);

  // ─────────────────────────────────────────────── Early exit
  if (!table) return null;
  // ─────────────────────────────────────────────── Render helpers
  const renderGrid = () => {
    const grouped: Record<string, TableRow[]> = {};
    table.rows.forEach((row) => {
      const key = row.diameter?.toString() ?? 'null';
      (grouped[key] ||= []).push(row);
    });

    return Object.values(grouped).flatMap((group) =>
      group.map((row, idx) => {
        const breakPage = idx % 2 === 1 || idx === group.length - 1;
        const globalIndex = table.rows.findIndex((r) => r.id === row.id);
        return (
          <div key={row.id} style={{ breakAfter: breakPage ? 'page' : undefined }}>
            <Label
              row={row}
              table={table}
              // canvasRef={(el) => {
              //   canvasRefs.current[globalIndex] = el;
              // }}
              shapeOptions={shapeOptions}
              onReady={handleLabelReady}
            />
          </div>
        );
      })
    );
  };

  const renderSingle = () =>
    [...table.rows]
      .sort((a, b) => {
        if (a.diameter == null) return 1;
        if (b.diameter == null) return -1;
        return a.diameter - b.diameter;
      })
      .map((row, index) => (
        <div
          key={row.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pageBreakAfter: index < table.rows.length - 1 ? 'always' : 'auto',
            margin: 'auto',
          }}
        >
          <Label
            row={row}
            table={table}
            // canvasRef={(el) => {
            //   canvasRefs.current[index] = el;
            // }}
            shapeOptions={shapeOptions}
            onReady={handleLabelReady}
          />
        </div>
      ));

  // ─────────────────────────────────────────────── JSX
  return (
    <div
      className={`text-black font-[Poppins] text-[10pt] leading-tight print:bg-white ${layout === 'table' ? 'print:p-1' : ''}`}
    >
      <PrettyButton className='w-full no-print m-2.5' color='purple' onClick={() => window.print()}>
        Ponovo printaj
      </PrettyButton>
      {layout === 'table' ? (
        <PrintTable table={table} shapeOptions={shapeOptions} onReady={handleLabelReady} />
      ) : layout === 'grid' ? (
        <div className="flex flex-col items-center gap-[2cm] print:h-[29.7cm]">{renderGrid()}</div>
      ) : (
        renderSingle()
      )}

      {/* Debug overlay (comment out in prod) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='no-print' style={{ position: 'fixed', bottom: 8, right: 8, fontSize: 12, background: '#fff8', padding: 4 }}>
          {readyCount}/{totalRowsRef.current} ready
        </div>
      )}
    </div>
  );
}
