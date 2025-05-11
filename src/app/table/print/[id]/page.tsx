// src/app/table/print/[id]/page.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PDF417 from "pdf417-generator";
import { TableService } from "@/services/table.service";
import { Table } from "@/models/Table";
import { TableRow } from "@/models/TableRow";
import Label from "@/components/common/print/PrintLabel";
import PrintTable from "@/components/common/print/PrintTable";  // ← New import
import { ShapeConfiguration } from "@/models/ShapeConfiguration";
import { ConfigurationService } from "@/services/configuration.service";

export default function PrintableLabels() {
  const params = useParams();
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") ?? "single";
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);

  const [table, setTable] = useState<(Table & { rows: TableRow[] }) | null>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // Fetch table + rows, sort by diameter and optionally flatten for grid
  useEffect(() => {
    const id = Number(params.id);
    if (!isNaN(id)) {
      TableService.getTableWithRows(id).then((res) => {
        let rows = [...res.rows].sort((a, b) => {
          if (a.diameter == null) return 1;
          if (b.diameter == null) return -1;
          return a.diameter - b.diameter;
        });

        if (layout === "grid") {
          const grouped: Record<string, typeof rows> = {};
          rows.forEach((row) => {
            const key = row.diameter?.toString() ?? "null";
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
          });
          rows = Object.values(grouped).flat();
        }

        setTable({ ...res, rows });
      });
      ConfigurationService.getAll().then(setShapeOptions);
    }
  }, [params.id]);

// inside your useEffect for printing
useEffect(() => {
  if (!table) return;

  // draw barcodes (unchanged)
  if (layout !== "table") {
    table.rows.forEach((row, i) => {
      const c = canvasRefs.current[i];
      if (c && row.oblikIMere) PDF417.draw(row.oblikIMere, c, 3, 3);
    });
  }

  // wait for all images to load
  const imgs: HTMLImageElement[] = Array.from(
    document.querySelectorAll("img")
  );
  if (imgs.length === 0) {
    window.print();
    return;
  }

  let loaded = 0;
  const onLoad = () => {
    loaded++;
    if (loaded === imgs.length) {
      window.print();
    }
  };

  imgs.forEach((img) => {
    // if already loaded (cached), count it
    if (img.complete && img.naturalWidth > 0) {
      onLoad();
    } else {
      img.addEventListener("load", onLoad);
      img.addEventListener("error", onLoad); // count errors too
    }
  });
}, [table, layout]);

  if (!table) return null;

  return (
    <div className="text-black font-[Poppins] text-[10pt] leading-tight print:p-4 print:bg-white">
      {layout === "table" ? (
        // New table-printing branch
        <PrintTable table={table} shapeOptions={shapeOptions} />
      ) : layout === "grid" ? (
        // Existing grid-label branch
        <div className="flex flex-col items-center gap-[2cm] print:h-[29.7cm]">
          {(() => {
            const grouped: Record<string, TableRow[]> = {};
            table.rows.forEach(row => {
              const key = row.diameter?.toString() ?? "null";
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(row);
            });
            return Object.values(grouped).flatMap((group) =>
              group.map((row, idx) => {
                const isLast = idx === group.length - 1;
                const isSecond = idx % 2 === 1;
                const breakPage = isSecond || isLast;
                const globalIndex = table.rows.findIndex(r => r.id === row.id);

                return (
                  <div
                    key={row.id}
                    style={{ breakAfter: breakPage ? "page" : undefined }}
                  >
                    <Label
                      row={row}
                      table={table}
                      canvasRef={el => { canvasRefs.current[globalIndex] = el; }}
                      shapeOptions={shapeOptions}
                    />
                  </div>
                );
              })
            );
          })()}
        </div>
      ) : (
        // Existing single-label branch
        table.rows.sort((a, b) => {
          if (a.diameter == null) return 1;
          if (b.diameter == null) return -1;
          return a.diameter - b.diameter;
        }).map((row, index) => (
          <div
            key={row.id}
            style={{
              width: "21cm",
              height: "29.7cm",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pageBreakAfter: index < table.rows.length - 1 ? "always" : "auto",
              margin: "auto",
            }}
          >
            <Label
              row={row}
              table={table}
              canvasRef={el => { canvasRefs.current[index] = el; }}
              shapeOptions={shapeOptions}
            />
          </div>
        ))
      )}
    </div>
  );
}
