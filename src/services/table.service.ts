// src/services/table.service.ts
import { Table } from "@/models/Table";
import { get, post, put } from "./base.service";
import { TableRow } from "@/models/TableRow";

type TableWithRows = Table & { rows: TableRow[] };

export const TableService = {
  async createTableWithRows(
    name: string,
    rows: Omit<TableRow, "id" | "tableId" | "createdAt" | "updatedAt">[]
  ): Promise<TableWithRows> {
    return post<TableWithRows>("/api/table/create", { name, rows });
  },

  async getTableWithRows(tableId: number): Promise<TableWithRows> {
    return get<TableWithRows>(`/api/table/${tableId}`);
  },

  async updateRow(id: number, data: Partial<TableRow>): Promise<TableRow> {
    return put<TableRow>(`/api/row/${id}`, data);
  },

  async getPaginated(page: number, pageSize: number = 10): Promise<{ items: Table[]; total: number }> {
    const res = await fetch(`/api/table/all?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error("Failed to fetch tables");
    const data = await res.json();
    return data.result;
  },

  async updateTableWithRows(
    id: number,
    name: string,
    rows: Omit<TableRow, "id" | "createdAt" | "updatedAt">[]
    ): Promise<TableWithRows> {
    return put<TableWithRows>("/api/table/update", { id, name, rows });
  }
};
