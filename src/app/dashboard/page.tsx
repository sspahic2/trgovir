'use client';

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import InfiniteScroller from "@/components/InfiniteScroller";
import { Table } from "@/models/Table";
import { useRouter } from "next/navigation";
import { TableService } from "@/services/table.service";
import PrettyButton from "@/components/common/button/PrettyButton";
import { PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);

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

  const res = await fetch('https://trgovir-flask.onrender.com/extract', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    console.error("Failed to extract");
    setIsImporting(false);
    return;
  }
  console.log({res})

  const extractedData = await res.json();
  console.log('Extracted:', extractedData);

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
        <div className="bg-gray-100 px-4 py-2 font-medium text-sm grid grid-cols-3">
          <div>#</div>
          <div>Name</div>
          <div>Created</div>
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
              className="px-4 py-2 border-t text-sm grid grid-cols-3 hover:bg-gray-200 cursor-pointer transition"
              onClick={() => router.push(`/table/update/${item.id}`)}
            >
              <div>{index + 1}</div>
              <div className="font-medium">{item.name}</div>
              <div className="text-gray-500">{formatDate(item.updatedAt)}</div>
            </div>
          )}
        />
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
