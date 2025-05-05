'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TableService } from "@/services/table.service";
import TableEditorForm from "@/components/table/TableEditorForm";
import { Table } from "@/models/Table";
import { TableRow } from "@/models/TableRow";
import { ConfigurationService } from "@/services/configuration.service";
import { ShapeConfiguration } from "@/models/ShapeConfiguration";

export default function TableUpdatePage() {
  const { data: session } = useSession();
  const [initialData, setInitialData] = useState<Table & { rows: TableRow[] } | null>(null);
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const id = Number(params.id);
    if (!isNaN(id)) {
      TableService.getTableWithRows(id).then(setInitialData);
      ConfigurationService.getAll().then(setShapeOptions);
    }
  }, [params]);

  if (!session?.user?.email || !initialData || shapeOptions === null) return null;

  return (
    <TableEditorForm
      mode="update"
      userEmail={session.user.email}
      initialTable={initialData}
      shapeOptions={shapeOptions}
      onSave={async (table, rows) => {
        if (!initialData) return;
        await TableService.updateTableWithRows(initialData.id, table, rows);
      }}
    />
  );
}
