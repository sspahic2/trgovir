// src/components/common/print/PrintTable.tsx
'use client';

import React, { useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import type { TableRow } from '@/models/TableRow';
import type { Table } from '@/models/Table';
import ShapeCanvas from '@/components/shape/ShapeCanvas';
import { ShapeConfiguration } from '@/models/ShapeConfiguration';
import { useInputRefs } from '@/hooks/useInputRefs';
import PrintTableRow from './PrintTableRow';

/* ──────────────────────────────── Main PrintTable component */
interface PrintTableProps {
  table: Table & { rows: TableRow[] };
  shapeOptions: ShapeConfiguration[] | null;
  /** Parent expects this to fire once per row */
  onReady?: () => void;
}

export default function PrintTable({
  table,
  shapeOptions,
  onReady,
}: PrintTableProps) {
  /* Build grouping so ShapeCanvas gets its input refs */
  const grouping = useMemo(() => {
    const byPos: Record<string, TableRow[]> = {};
    table.rows.forEach((r) => (byPos[r.position || 'Unspecified'] ||= []).push(r));

    return Object.entries(byPos).map(([position, rows], idx) => ({
      position,
      positionIndex: idx,
      rows: rows.map((r) => ({
        oblikIMere: r.oblikIMere,
        diameter: r.diameter,
        lg: r.lg,
        n: r.n,
        lgn: r.lgn,
        tableId: r.tableId,
        position: r.position,
        ozn: r.ozn,
      })),
    }));
  }, [table.rows]);

  const { rowInputs } = useInputRefs(grouping, shapeOptions ?? []);

  /* Helper styles */
  const thCell = (bg?: string): React.CSSProperties => ({
    border: '1px solid #000',
    padding: '0.4rem',
    textAlign: 'center',
    background: bg ?? undefined,
  });

  /* Group by Ø so every page has its own header */
  const byDiameter: Record<string, TableRow[]> = {};
  table.rows.forEach(
    (r) => (byDiameter[r.diameter?.toString() || 'null'] ||= []).push(r)
  );

  return (
    <>
      {Object.entries(byDiameter).map(([diameter, rowsByØ], di) => {
        const byPos: Record<string, TableRow[]> = {};
        rowsByØ.forEach((r) => (byPos[r.position || 'Unspecified'] ||= []).push(r));

        return (
          <div key={diameter}>
            {/* page break before every new Ø except the first */}
            <div
              style={{
                pageBreakBefore: di > 0 ? 'always' : undefined,
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h1 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{diameter}Ø</h1>
              <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
                {['KLIJENT', 'ADRESA', 'GRADILIŠTE'].map((label) => (
                  <div key={label}>
                    {label}:&nbsp;
                    <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      {label === 'KLIJENT'
                        ? table.client
                        : label === 'ADRESA'
                        ? table.address
                        : table.job}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {Object.entries(byPos).map(([position, posRows]) => (
              <table
                key={position}
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '1.5rem',
                  pageBreakInside: 'auto',
                }}
              >
                <thead>
                  <tr>
                    <th colSpan={6} style={thCell('#f0f0f0')}>
                      {position}
                    </th>
                  </tr>
                  <tr>
                    {[
                      'ozn',
                      'Oblik i Dimenzije Šipke',
                      'Prečnik',
                      'Dužina',
                      'Količina',
                      'Ukupno',
                    ].map((h) => (
                      <th key={h} style={thCell('#fafafa')}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posRows.map((row, rowIdx) => (
                    <PrintTableRow
                      key={row.id}
                      row={row}
                      rowIdx={rowIdx}
                      position={position}
                      rowInputs={rowInputs}
                      onReady={onReady}
                    />
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        );
      })}
    </>
  );
}
