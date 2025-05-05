'use client';

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import InfiniteScroller from "@/components/InfiniteScroller";
import { Table } from "@/models/Table";
import { useRouter } from "next/navigation";
import { TableService } from "@/services/table.service";
import PrettyButton from "@/components/common/button/PrettyButton";
import { PlusCircle, Printer } from "lucide-react";
import { PrettyModal } from "@/components/common/modal/PrettyModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [printModal, setPrintModal] = useState(-100);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  if (status !== "authenticated") return null;

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API}extract-preview`, {
      method: 'POST',
      body: formData,
      credentials: "include"
    });

    if (!res.ok) {
      console.error("Failed to extract");
      setIsImporting(false);
      return;
    }

    const extractedData = await res.json();
    // Now redirect to /table/create with extracted data
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    router.push(`/table/create?imported=${encodeURIComponent(JSON.stringify(extractedData))}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      <h1 className="text-2xl font-bold mb-4 flex items-center justify-start gap-2">
        Your Tables
        <PrettyButton
          color="blue"
          className="flex items-center justify-center p-0"
          onClick={() => router.push("/table/create")}
          aria-label="Create new table"
        >
          <PlusCircle size={20} />
        </PrettyButton>

        <PrettyButton
          color="green"
          className="flex items-center justify-center p-0 text-sm"
          onClick={handleImportClick}
          aria-label="Import table from PDF"
          loading={isImporting}
          disabled={isImporting}
        >
          Import
        </PrettyButton>
      </h1>

      <div className="border rounded-lg overflow-hidden shadow">
        <div className="bg-gray-100 px-4 py-2 font-medium text-sm grid grid-cols-4">
          <div>#</div>
          <div>Name</div>
          <div>Created</div>
          <div>Actions</div>
        </div>

        <InfiniteScroller<Table>
          fetchFn={async (page) => {
            const res = await TableService.getPaginated(page, 10);
            return res;
          }}
          pageSize={10}
          renderItem={(item, index) => (
            <div
              key={item.id}
              className="px-4 py-2 border-t text-sm grid grid-cols-4 items-center hover:bg-gray-200 transition group"
            >
              <div>{index + 1}</div>

              <div
                className="font-medium cursor-pointer"
                onClick={() => router.push(`/table/update/${item.id}`)}
              >
                {item.name}
              </div>

              <div className="text-gray-500">{formatDate(item.updatedAt)}</div>

              <div>
                <button
                  onClick={() => setPrintModal(item.id)}
                  className="text-purple-600 hover:text-purple-800 transition cursor-pointer"
                  title="Print label"
                >
                  <Printer className="w-5 h-5 text-purple-600 hover:text-purple-800" />
                </button>
              </div>
            </div>
          )}
        />

        {printModal != -100 && (
          <PrettyModal
            isOpen
            onClose={() => setPrintModal(-100)}
            title="Odaberi izgled naljepnica"
          >
            <div className="flex justify-center gap-6">
              <button
                onClick={() =>
                  window.location.assign(`/table/print/${printModal}?layout=single`)
                }
                className="border-2 border-zinc-300 rounded-lg hover:border-purple-500 transition p-2"
              >
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <rect x="10" y="10" width="80" height="80" fill="#e5e5e5" stroke="#000" strokeWidth="2" />
                </svg>
                <div className="text-center mt-2 text-sm">1 po strani</div>
              </button>

              <button
                onClick={() =>
                  window.location.assign(`/table/print/${printModal}?layout=grid`)
                }
                className="border-2 border-zinc-300 rounded-lg hover:border-purple-500 transition p-2"
              >
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <rect x="10" y="10" width="80" height="35" fill="#e5e5e5" stroke="#000" strokeWidth="2" />
                  <rect x="10" y="55" width="80" height="35" fill="#e5e5e5" stroke="#000" strokeWidth="2" />
                </svg>
                <div className="text-center mt-2 text-sm">2 po strani</div>
              </button>
            </div>
          </PrettyModal>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return `${diffMinutes} minute(s) ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour(s) ago`;
  }

  if (diffDays < 3) {
    return `${diffDays} day(s) ago`;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
