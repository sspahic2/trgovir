'use client';

import { PrettyModal } from "@/components/common/modal/PrettyModal";
import { Table as TableIcon } from "lucide-react";

export default function PrintModal({
  tableId,
  onClose,
}: {
  tableId: number;
  onClose: () => void;
}) {
  const openInNewTab = (layout: string) => {
    window.open(`/table/print/${tableId}?layout=${layout}`, "_blank");
    onClose(); // close modal after triggering
  };

  return (
    <PrettyModal
      isOpen={true}
      onClose={onClose}
      title="Odaberi izgled naljepnica"
    >
      <div className="flex justify-center gap-6">
        {/* Single layout */}
        <button
          onClick={() => openInNewTab("single")}
          className="border-2 border-zinc-300 rounded-lg hover:border-purple-500 transition p-2"
        >
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              fill="#e5e5e5"
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
          <div className="text-center mt-2 text-sm">1 po strani</div>
        </button>

        {/* Grid layout */}
        <button
          onClick={() => openInNewTab("grid")}
          className="border-2 border-zinc-300 rounded-lg hover:border-purple-500 transition p-2"
        >
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <rect
              x="10"
              y="10"
              width="80"
              height="35"
              fill="#e5e5e5"
              stroke="#000"
              strokeWidth="2"
            />
            <rect
              x="10"
              y="55"
              width="80"
              height="35"
              fill="#e5e5e5"
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
          <div className="text-center mt-2 text-sm">2 po strani</div>
        </button>

        {/* Table layout */}
        <button
          onClick={() => openInNewTab("table")}
          className="border-2 border-zinc-300 rounded-lg hover:border-purple-500 transition p-2"
        >
          <TableIcon className="w-24 h-24" />
          <div className="text-center mt-2 text-sm">Tabela</div>
        </button>
      </div>
    </PrettyModal>
  );
}
