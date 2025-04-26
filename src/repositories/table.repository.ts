import { prisma } from "../../lib/prisma";
import type { TableRow } from "@/models/TableRow";

export const TableRepository = {
  async getById(id: number) {
    return prisma.table.findUnique({
      where: { id },
      include: { rows: true },
    });
  },

  async getByTableId(tableId: number) {
    return prisma.tableRow.findMany({
      where: { tableId }
    });
  },

  async getAll() {
    return prisma.table.findMany({
      include: { rows: true },
      orderBy: { updatedAt: "desc" }
    });
  },

  async create(data: Omit<TableRow, "id">) {
    return prisma.tableRow.create({ data });
  },
  
  async update(id: number, data: Partial<Omit<TableRow, "id">>) {
    return prisma.tableRow.update({ where: { id }, data });
  },  

  async delete(id: number) {
    return prisma.tableRow.delete({ where: { id } });
  },

  async createWithRows(name: string, rows: Omit<TableRow, "id" | "tableId" | "createdAt" | "updatedAt">[]) {
    return prisma.table.create({
      data: {
        name,
        rows: {
          create: rows.map((row) => ({
            oblikIMere: row.oblikIMere,
            diameter: Number(row.diameter),
            lg: Number(row.lg),
            n: Number(row.n),
            lgn: Number(row.lgn),
          })),
        },
      },
      include: { rows: true },
    });
  },

  async getPaginated(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.table.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.table.count(),
    ]);
  
    return {
      items,
      total,
      page,
      pageSize,
    };
  },

  async updateWithRows(
    id: number,
    name: string,
    rows: Omit<TableRow, "id" | "createdAt" | "updatedAt">[]
  ) {
    // Delete existing rows
    await prisma.tableRow.deleteMany({ where: { tableId: id } });
  
    // Recreate rows
    const updated = await prisma.table.update({
      where: { id },
      data: {
        name,
        rows: {
          create: rows.map(row => ({
            oblikIMere: row.oblikIMere,
            diameter: Number(row.diameter),
            lg: Number(row.lg),
            n: Number(row.n),
            lgn: Number(row.lgn),
          }))
        }
      },
      include: { rows: true }
    });
  
    return updated;
  }
};
