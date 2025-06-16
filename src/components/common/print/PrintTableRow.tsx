import ShapeCanvas from "@/components/shape/ShapeCanvas";
import { useInputRefs } from "@/hooks/useInputRefs";
import { TableRow } from "@/models/TableRow";
import { useRef, useCallback, useLayoutEffect } from "react";

interface PrintTableRowProps {
  row: TableRow;
  rowIdx: number;
  position: string;
  rowInputs: ReturnType<typeof useInputRefs>['rowInputs'];
  onReady?: () => void;
}

const PrintTableRow: React.FC<PrintTableRowProps> = ({
  row,
  rowIdx,
  position,
  rowInputs,
  onReady,
}) => {
  const reportedRef = useRef(false);
  const isBitmap = row.oblikIMere?.startsWith('extracted_shapes');

  const reportReady = useCallback(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReady?.();
  }, [onReady]);

  /* For drawn shapes: report after first paint */
  useLayoutEffect(() => {
    if (!isBitmap) reportReady();
  }, [isBitmap, reportReady]);

  /* For bitmaps: report when <img> finishes */
  const handleImg = () => reportReady();

  const td: React.CSSProperties = {
    border: '1px solid #000',
    padding: '0.4rem',
    textAlign: 'center',
  };

  const ukupno =
    row.lgn != null
      ? row.lgn.toFixed(2)
      : row.lg != null && row.n != null
      ? (row.lg * row.n).toFixed(2)
      : '-';

  return (
    <tr>
      <td style={td}>{row.ozn}</td>

      {/* Shape cell */}
      <td style={td}>
        {isBitmap ? (
          <img
            src={`${process.env.NEXT_PUBLIC_FLASK_API}${row.oblikIMere}`}
            alt=""
            style={{ maxHeight: '4rem', display: 'block', margin: '0 auto' }}
            onLoad={handleImg}
            onError={handleImg}
          />
        ) : (
          <ShapeCanvas
            rawConfig={row.oblikIMere}
            mode="input"
            width={100}
            height={120}
            rowIndex={rowIdx}
            position={position}
            ozn={row.ozn}
            rowInputs={rowInputs}
          />
        )}
      </td>

      <td style={td}>{row.diameter ?? '-'}</td>
      <td style={td}>{row.lg ?? '-'}</td>
      <td style={td}>{row.n ?? '-'}</td>
      <td style={td}>{ukupno}</td>
    </tr>
  );
};

export default PrintTableRow;