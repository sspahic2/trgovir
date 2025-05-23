// src/services/table.service.ts
import { get, post, put } from "./base.service";
import type { Table } from "@/models/Table";
import type { TableRow } from "@/models/TableRow";
import type { EditableRow, EditableTable } from "@/hooks/useTableEditor";

type TableWithRows = Table & { rows: TableRow[] };

export const TableService = {
  async createTableWithRows(
    table: EditableTable,
    rows: EditableRow[]
  ): Promise<TableWithRows> {
    return post<TableWithRows>("/api/table/create", { table, rows });
  },

  async getTableWithRows(tableId: number): Promise<TableWithRows> {
    return get<TableWithRows>(`/api/table/${tableId}`);
  },

  async updateRow(id: number, data: Partial<TableRow>): Promise<TableRow> {
    return put<TableRow>(`/api/row/${id}`, data);
  },

  async getPaginated(
    page: number,
    pageSize: number = 10
  ): Promise<{ items: Table[]; total: number }> {
    const res = await fetch(`/api/table/all?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error("Failed to fetch tables");
    const data = await res.json();
    return data.result;
  },

  async updateTableWithRows(
    id: number,
    table: EditableTable,
    rows: EditableRow[]
  ): Promise<TableWithRows> {
    return put<TableWithRows>("/api/table/update", { id, table, rows });
  },

  // ← NEW delete method
  async delete(id: number): Promise<boolean> {
    return post<boolean>("/api/table/delete", { id });
  },
};
