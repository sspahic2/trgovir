'use client';

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InfiniteScroller from "@/components/InfiniteScroller";
import { Table } from "@/models/Table";
import { TableService } from "@/services/table.service";
import PrettyButton from "@/components/common/button/PrettyButton";
import { PlusCircle, Printer, Table as TableIcon, Trash2 } from "lucide-react";
import { PrettyModal } from "@/components/common/modal/PrettyModal";
import PrintModal from "@/components/modal/PrintModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [printModal, setPrintModal] = useState(-100);

  const [tables, setTables] = useState<Table[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      reload();
    }
  }, [status]);

  if (status !== "authenticated") return null;

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    const res = await TableService.getPaginated(page, 10);
    setTables(prev => [...prev, ...res.items]);
    setTotal(res.total);
    setPage(prev => prev + 1);
    setLoading(false);
  }

  async function reload() {
    setTables([]);
    setPage(1);
    setTotal(0);
    setLoading(true);
    const res = await TableService.getPaginated(1, 10);
    setTables(res.items);
    setTotal(res.total);
    setPage(2);
    setLoading(false);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API}extract-preview`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to extract");
      setIsImporting(false);
      return;
    }

    const extractedData = await res.json();
    sessionStorage.setItem("imported_table_data", JSON.stringify(extractedData));
    fileInputRef.current!.value = "";
    setIsImporting(false);
    router.push(`/table/create`);
  }


  return (
    <div className="p-8 max-w-5xl mx-auto">
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
          loading={isImporting}
          disabled={isImporting}
        >
          Import
        </PrettyButton>
      </h1>

      <div className="border rounded-lg overflow-hidden shadow">
        <div className="bg-gray-100 px-4 py-2 font-medium text-sm grid grid-cols-[40px_1fr_140px_80px]">
          <div>#</div>
          <div>Name</div>
          <div>Created</div>
          <div>Actions</div>
        </div>

        <InfiniteScroller<Table>
          items={tables}
          hasMore={tables.length < total}
          loading={loading}
          onLoadMore={loadMore}
          renderItem={(item, index) => (
            <div
              key={item.id}
              className="px-4 py-2 border-t text-sm grid grid-cols-[40px_1fr_140px_80px] items-center hover:bg-gray-200 transition group"
            >
              <div>{index + 1}</div>
              <div
                className="font-medium cursor-pointer"
                onClick={() => router.push(`/table/update/${item.id}`)}
              >
                {item.name}
              </div>
              <div className="text-gray-500">{formatDate(item.updatedAt)}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPrintModal(item.id)}
                  className="text-purple-600 hover:text-purple-800 transition"
                  title="Choose print layout"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Jeste li sigurni da želite obrisati ovu tabelu?")) {
                      await TableService.delete(item.id);
                      await reload(); // trigger full reload
                    }
                  }}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete table"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        />

        {printModal != -100 && (
          <PrintModal tableId={printModal} onClose={() => setPrintModal(-100)} />
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

  if (diffHours < 1) return `${diffMinutes} minute(s) ago`;
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  if (diffDays < 3) return `${diffDays} day(s) ago`;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
