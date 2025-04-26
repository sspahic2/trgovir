'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TableEditorForm from "@/components/table/TableEditorForm";
import { TableService } from "@/services/table.service";
import { ConfigurationService } from "@/services/configuration.service";
import { ShapeConfiguration } from "@/models/ShapeConfiguration";

export default function TableCreateContent() {
  const { data: session } = useSession();
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);

  const searchParams = useSearchParams();
  const imported = searchParams.get('imported');
  const importedData = imported ? JSON.parse(decodeURIComponent(imported)) : null;

  useEffect(() => {
    if (!session?.user?.email) return;
    ConfigurationService.getAll().then(setShapeOptions);
  }, [session]);

  if (!session?.user?.email || shapeOptions === null) return null;

  return (
    <TableEditorForm
      mode="create"
      userEmail={session.user.email}
      importedRows={importedData || undefined}
      shapeOptions={shapeOptions}
      onSave={async (name, rows) => {
        await TableService.createTableWithRows(name, rows);
      }}
      onCancel={() => window.history.back()}
    />
  );
}
