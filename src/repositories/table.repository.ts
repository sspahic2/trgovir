import { Table } from "@/models/Table";
import { prisma } from "../../lib/prisma";
import type { TableRow } from "@/models/TableRow";

export const TableRepository = {
  async getById(id: number) {
    return prisma.table.findUnique({
      where: { id },
      include: { rows: {
        orderBy: { id: 'asc' }
      } }
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
    // remove all rows first to avoid foreign key issues
    await prisma.tableRow.deleteMany({ where: { tableId: id } });
    return await prisma.table.delete({ where: { id } });
    
  },

  async createWithRows(table: Omit<Table, "id">, rows: Omit<TableRow, "id" | "tableId" | "createdAt" | "updatedAt">[]) {
    return prisma.table.create({
      data: {
        ...table,
        id: undefined,
        rows: {
          create: rows.map((row) => ({
            oblikIMere: row.oblikIMere,
            diameter: Number(row.diameter),
            lg: Number(row.lg),
            n: Number(row.n),
            lgn: Number(row.lgn),
            position: row.position,
            ozn: Number(row.ozn)
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
    table: Table,
    rows: Omit<TableRow, "id" | "createdAt" | "updatedAt">[]
  ) {
    // Delete existing rows
    await prisma.tableRow.deleteMany({ where: { tableId: id } });
  
    // Recreate rows
    const updated = await prisma.table.update({
      where: { id },
      data: {
        ...table,
        rows: {
          create: rows.map(row => ({
            oblikIMere: row.oblikIMere,
            diameter: Number(row.diameter),
            lg: Number(row.lg),
            n: Number(row.n),
            lgn: Number(row.lgn),
            position: row.position,
            ozn: Number(row.ozn)
          }))
        }
      },
      include: { rows: true }
    });
  
    return updated;
  }
};
