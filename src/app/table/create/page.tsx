'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle } from "lucide-react";
import type { TableRow } from "@/models/TableRow";
import PrettyInput from "@/components/common/input/PrettyInput";
import PrettyButton from "@/components/common/button/PrettyButton";
import { useTableEditor } from "@/hooks/useTableEditor";
import { useEffect } from "react";

export default function TableCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    isSuperAdmin,
    rows,
    saved,
    nextFocusRef,
    handleAddRow,
    handleDeleteRow,
    handleChange,
    handleKeyDown,
    isSaving,
    handleSave,
    initIfSuperAdmin,
  } = useTableEditor();

  useEffect(() => {
    if (status === "authenticated") {
      initIfSuperAdmin(session?.user?.email, () => router.replace("/dashboard"));
    }
  }, [status, session, router, initIfSuperAdmin]);

  if (!isSuperAdmin) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-end mb-4 gap-2">
        <PrettyButton color="red" onClick={() => router.replace("/dashboard")}>Discard</PrettyButton>
        <PrettyButton onClick={handleSave} loading={isSaving}>
          {saved ? "Saved" : "Save"}
        </PrettyButton>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="p-2">ozn</th>
            <th className="p-2 w-[33%]">
              <div className="flex flex-col items-center">
                <span>oblik i mere</span>
                <span className="text-xs">[cm]</span>
              </div>
            </th>
            <th className="p-2">Ø</th>
            <th className="p-2">
              <div className="flex flex-col items-center">
                <span>lg</span>
                <span className="text-xs">[m]</span>
              </div>
            </th>
            <th className="p-2">
              <div className="flex flex-col items-center">
                <span>n</span>
                <span className="text-xs">[kom]</span>
              </div>
            </th>
            <th className="p-2">
              <div className="flex flex-col items-center">
                <span>lgn</span>
                <span className="text-xs">[m]</span>
              </div>
            </th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="text-center">
              <td className="border px-2 py-1 text-sm">{row.id}</td>
              <td className="border px-2 py-1 w-[33%]">
                <PrettyInput
                  type="text"
                  value={row.oblikIMere}
                  disabled
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  ref={index === rows.length - 1 ? nextFocusRef : null}
                  type="number"
                  value={row.diameter ?? ""}
                  onChange={(e) => handleChange(row.id, "diameter", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.lg ?? ""}
                  onChange={(e) => handleChange(row.id, "lg", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.n ?? ""}
                  onChange={(e) => handleChange(row.id, "n", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.lgn ?? ""}
                  onChange={(e) => handleChange(row.id, "lgn", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              </td>
              <td className="border px-2 py-1">
                <button onClick={() => handleDeleteRow(row.id)}>
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => handleAddRow()}
        className="w-full mt-2 bg-blue-200 text-blue-800 py-2 rounded flex justify-center items-center transition-all duration-200 ease-in-out hover:bg-blue-300 hover:scale-[1.02] cursor-pointer"
      >
        <PlusCircle size={22} />
      </button>
    </div>
  );
}
