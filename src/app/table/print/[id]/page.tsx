'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PDF417 from "pdf417-generator";
import { TableService } from "@/services/table.service";
import { Table } from "@/models/Table";
import { TableRow } from "@/models/TableRow";
import Label from "@/components/common/print/PrintLabel";
import { ShapeConfiguration } from "@/models/ShapeConfiguration";
import { ConfigurationService } from "@/services/configuration.service";

export default function PrintableLabels() {
  const params = useParams();
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") ?? "single";
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);

  const [table, setTable] = useState<(Table & { rows: TableRow[] }) | null>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  useEffect(() => {
    const id = Number(params.id);
    if (!isNaN(id)) {
      TableService.getTableWithRows(id).then((res) => {
        let rows = [...res.rows].sort((a, b) => {
          if (a.diameter == null) return 1;
          if (b.diameter == null) return -1;
          return a.diameter - b.diameter;
        });

        if(layout == 'grid') {
          const groupedByDiameter: Record<string, typeof rows> = {};
          for (const row of rows) {
            const key = row.diameter?.toString() ?? 'null';
            if (!groupedByDiameter[key]) groupedByDiameter[key] = [];
            groupedByDiameter[key].push(row);
          }
        
          rows = Object.values(groupedByDiameter).flat();
        }

        setTable({ ...res, rows: rows });
      });
      ConfigurationService.getAll().then(setShapeOptions);
    }
  }, [params.id]);

  useEffect(() => {
    if (table) {
      table.rows.forEach((row, index) => {
        const canvas = canvasRefs.current[index];
        if (canvas && row.oblikIMere) {
          PDF417.draw(row.oblikIMere, canvas, 3, 3);
        }
      });

      setTimeout(() => window.print(), 1000);
    }
  }, [table]);

  if (!table) return null;

  return (
    <div className="text-black font-[Poppins] text-[10pt] leading-tight print:p-4 print:bg-white">
      {layout === "grid" ? (
        <div className="flex flex-col items-center gap-[2cm] print:h-[29.7cm]">
        {(() => {
          const groupedByDiameter: Record<string, TableRow[]> = {};
          for (const row of table.rows) {
            const key = row.diameter?.toString() ?? 'null';
            if (!groupedByDiameter[key]) groupedByDiameter[key] = [];
            groupedByDiameter[key].push(row);
          }

          return Object.values(groupedByDiameter).flatMap((group) =>
            group.map((row, index) => {
              const isLastInGroup = index === group.length - 1;
              const isSecond = index % 2 === 1;
              const shouldBreak = isSecond || isLastInGroup;

              const globalIndex = table.rows.findIndex((r) => r.id === row.id);

              return (
                <div
                  key={row.id}
                  style={{ breakAfter: shouldBreak ? 'page' : undefined }}
                >
                  <Label
                    row={row}
                    table={table}
                    canvasRef={(el) => {
                      canvasRefs.current[globalIndex] = el;
                    }}
                    shapeOptions={shapeOptions}
                  />
                </div>
              );
            })
          );
        })()}
        </div>
      ) : (
        table.rows.sort((a, b) => {
          if (a.diameter == null) return 1;
          if (b.diameter == null) return -1;
          return a.diameter - b.diameter;
        }).map((row, index) => (
          <div
            key={row.id}
            style={{
              width: '21cm',
              height: '29.7cm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pageBreakAfter: index < table.rows.length - 1 ? 'always' : 'auto',
              margin: 'auto'
            }}
          >
            <Label
              row={row}
              table={table}
              canvasRef={(el) => {
                canvasRefs.current[index] = el;
              }}
              shapeOptions={shapeOptions}
            />
          </div>
        ))
      )}
    </div>
  );
}
