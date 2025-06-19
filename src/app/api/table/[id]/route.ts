import { NextRequest, NextResponse } from 'next/server';
import { TableRepository } from '@/repositories/table.repository';
import { Table } from '@/models/Table';
import { TableRow } from '@/models/TableRow';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const dbTable = await TableRepository.getById(parsedId);

  if (!dbTable) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  const result = {
    id:        dbTable.id,
    client:    dbTable.client ?? "",
    address:   dbTable.address ?? "",
    job:       dbTable.job ?? "",
    name:      dbTable.name,
    createdAt: dbTable.createdAt,
    updatedAt: dbTable.updatedAt,
    rows: dbTable.rows.map(r => ({
      id:         r.id,
      ozn:        r.ozn_text ?? "1",
      oblikIMere: r.oblikIMere,
      diameter:   r.diameter,
      lg:         r.lg,
      n:          r.n,
      lgn:        r.lgn,
      tableId:    r.tableId,
      position:   r.position ?? "Nije označen",
      createdAt:  r.createdAt,
      updatedAt:  r.updatedAt,
    })),
  };

  return NextResponse.json({ result });
}
