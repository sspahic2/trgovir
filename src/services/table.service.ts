import type { TableRow } from "@/models/TableRow";
import { get, post, remove, put } from "./base.service";

export const TableService = {
  async getAll(): Promise<TableRow[]> {
    return get("/api/table/all");
  },

  async getById(id: number): Promise<TableRow> {
    return post("/api/table/get", { id });
  },

  async createRow(data: Omit<TableRow, "id">): Promise<TableRow> {
    return post("/api/table/create", data);
  },

  async updateRow(id: number, updates: Partial<Omit<TableRow, "id">>): Promise<TableRow> {
    return put("/api/table/update", { id, ...updates });
  },

  async deleteRow(id: number): Promise<void> {
    return remove("/api/table/delete", { id });
  }
};
