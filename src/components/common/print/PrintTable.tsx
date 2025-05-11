// src/components/common/print/PrintTable.tsx
'use client';
import React from 'react';
import type { TableRow } from '@/models/TableRow';
import type { Table } from '@/models/Table';
import { ShapeConfiguration, ShapeType } from '@/models/ShapeConfiguration';
import ShapeCanvas from '@/components/shape/ShapeCanvas';
import { parseGeneralConfig } from '@/lib/parser/parseShapeConfig';
import { ConnectedLinesShapeProps } from '@/components/shape/ConnectingLines';
import { LineShapeProps } from '@/components/shape/Line';
import { SquareWithTailProps } from '@/components/shape/SquareWithTail';

interface PrintTableProps {
  table: Table & { rows: TableRow[] };
  shapeOptions: ShapeConfiguration[] | null;
}

export default function PrintTable({ table, shapeOptions }: PrintTableProps) {
  const byDiameter: Record<string, TableRow[]> = {};
  table.rows.forEach(r => (byDiameter[r.diameter?.toString() || 'null'] ||= []).push(r));

  return (
    <>
      {Object.entries(byDiameter).map(([diameter, rows], di) => {
        // group by position
        const byPos: Record<string, TableRow[]> = {};
        rows.forEach(r => (byPos[r.position!] ||= []).push(r));

        return (
          <div key={diameter}>
            {/* only break before if NOT the first */}
            <div
              style={{
                pageBreakBefore: di > 0 ? 'always' : undefined,
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h1 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                {diameter}Ø
              </h1>
              <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
                <div>
                  KLIJENT:&nbsp;
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {table.client}
                  </span>
                </div>
                <div>
                  ADRESA:&nbsp;
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {table.address}
                  </span>
                </div>
                <div>
                  GRADILIŠTE:&nbsp;
                  <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {table.job}
                  </span>
                </div>
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
                    <th
                      colSpan={6}
                      style={{
                        border: '1px solid #000',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      {position}
                    </th>
                  </tr>
                  <tr>
                    {['#','Oblik i Dimenzije Šipke','Prečnik','Dužina','Količina','Ukupno'].map(h => (
                      <th
                        key={h}
                        style={{
                          border: '1px solid #000',
                          padding: '0.4rem',
                          textAlign: 'center',
                          background: '#fafafa',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posRows.map((row, idx) => {
                    const raw = row.lg != null && row.n != null ? row.lg * row.n : null;
                    const ukupno = raw != null ? raw.toFixed(2) : '-';
                    return (
                      <tr key={row.id}>
                        <td style={td}>{idx + 1}</td>
                        <td style={td}>
                          {row.oblikIMere?.startsWith('extracted_shapes') ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_FLASK_API}${row.oblikIMere}`}
                              alt=""
                              style={{ maxHeight: '4rem', display: 'block', margin: '0 auto' }}
                            />
                          ) : (
                            (() => {
                              try {
                                const type = row.oblikIMere!.split(';')[0] as ShapeType;
                                const parsed = parseGeneralConfig(row.oblikIMere!);
                                const squareProps =
                                  type === 'SquareWithTail'
                                    ? (parsed as SquareWithTailProps)
                                    : ({} as SquareWithTailProps);
                                const lineProps =
                                  type === 'Line'
                                    ? (parsed as LineShapeProps)
                                    : ({} as LineShapeProps);
                                const connProps =
                                  type === 'ConnectingLines'
                                    ? (parsed as ConnectedLinesShapeProps)
                                    : ({} as ConnectedLinesShapeProps);
                                const coords =
                                  shapeOptions
                                    ?.find(s => s.configuration === row.oblikIMere)
                                    ?.selectedCoords ?? [];

                                return (
                                  <ShapeCanvas
                                    shapeType={type}
                                    mode="view"
                                    squareProps={squareProps}
                                    lineProps={lineProps}
                                    connectedProps={connProps}
                                    selectedCoords={coords}
                                    onToggleCoord={()=>{}}
                                    width={100}
                                    height={50}
                                  />
                                );
                              } catch {
                                return <span style={{ color:'red',fontSize:'.8rem' }}>Invalid</span>;
                              }
                            })()
                          )}
                        </td>
                        <td style={td}>{row.diameter ?? '-'}</td>
                        <td style={td}>{row.lg ?? '-'}</td>
                        <td style={td}>{row.n ?? '-'}</td>
                        <td style={td}>{ukupno}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        );
      })}
    </>
  );
}

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: '0.4rem',
  textAlign: 'center',
};
