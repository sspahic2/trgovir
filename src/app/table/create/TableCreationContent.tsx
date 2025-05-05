'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TableEditorForm from "@/components/table/TableEditorForm";
import { TableService } from "@/services/table.service";
import { ConfigurationService } from "@/services/configuration.service";
import { ShapeConfiguration } from "@/models/ShapeConfiguration";
import { TableRow } from "@/models/TableRow";

export default function TableCreateContent() {
  const { data: session } = useSession();
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);

  const searchParams = useSearchParams();

  const [importedRows, setImportedRows] = useState<TableRow[] | null>(null);

  useEffect(() => {
    const imported = searchParams.get('imported');
    if (!imported) return;
  
    try {
      const decoded = decodeURIComponent(imported);
      const parsed = JSON.parse(decoded);
      console.log({decoded})
      const flatRows = !Array.isArray(parsed)
        ? Object.entries(parsed).flatMap(([position, rows]) =>
            (rows as any[]).map((row) => ({ ...row, position }))
          )
        : parsed;
  
      setImportedRows(flatRows);
    } catch (err) {
      console.error("Failed to parse imported data", err);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!session?.user?.email) return;
    ConfigurationService.getAll().then(setShapeOptions);
  }, [session]);

  if (!session?.user?.email || shapeOptions === null) return null;

  console.log({importedRows})

  return (
    <TableEditorForm
      mode="create"
      userEmail={session.user.email}
      importedRows={importedRows || undefined}
      shapeOptions={shapeOptions}
      onSave={async (table, rows) => {
        await TableService.createTableWithRows(table, rows);
      }}
      onCancel={() => window.history.back()}
    />
  );
}
