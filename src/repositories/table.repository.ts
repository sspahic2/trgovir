import { prisma } from "../../lib/prisma";
import type { TableRow } from "@/models/TableRow";

export const TableRepository = {
  async getById(id: number) {
    return prisma.tableRow.findUnique({ where: { id } });
  },

  async getAll() {
    return prisma.tableRow.findMany();
  },

  async create(data: Omit<TableRow, "id">) {
    return prisma.tableRow.create({ data });
  },

  async update(id: number, data: Partial<Omit<TableRow, "id">>) {
    return prisma.tableRow.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.tableRow.delete({ where: { id } });
  }
};
