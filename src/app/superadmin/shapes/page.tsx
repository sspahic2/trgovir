// src/app/superadmin/shapes/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PrettyButton from '@/components/common/button/PrettyButton';
import { PlusCircle, Trash2 } from 'lucide-react';
import ShapeCanvas from '@/components/shape/ShapeCanvas';
import { parseGeneralConfig } from '@/lib/parser/parseShapeConfig';
import { ConfigurationService } from '@/services/configuration.service';
import type { SquareWithTailProps } from '@/components/shape/SquareWithTail';
import type { LineShapeProps } from '@/components/shape/Line';
import type { ConnectedLinesShapeProps } from '@/components/shape/ConnectingLines';
import { ShapeConfiguration, ShapeType } from '@/models/ShapeConfiguration';
import ShapeCard from '@/components/shape/ShapeCard';

interface ShapeConfig {
  id: number;
  configuration: string;
  selectedCoords: { x: number; y: number }[];
}

export default function ShapeListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shapes, setShapes] = useState<ShapeConfiguration[]>([])

  // Fetch all shapes once authenticated
  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      const list = await ConfigurationService.getAll();
      console.log({list})
      setShapes(list);
    })();
  }, [status]);

  const handleDelete = async (id: number) => {
    await ConfigurationService.delete(id);
    setShapes(prev => prev.filter(s => s.id !== id));
  };

  if (status !== 'authenticated' || !session?.user?.isSuperAdmin) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-start items-center mb-6">
        <h1 className="text-2xl font-bold">All Shapes</h1>
        <PrettyButton
          color="blue"
          onClick={() => router.push("/superadmin/shapes/create")}
          className="rounded w-24 h-12 flex items-center justify-center ml-1"
          aria-label="Create new shape"
        >
          <PlusCircle size={20} />
        </PrettyButton>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {shapes?.map(shape => {
          // derive type & props
          const shapeType = shape.configuration.split(';')[0] as ShapeType;
          const parsed = parseGeneralConfig(shape.configuration);
          const squareProps  = shapeType === 'SquareWithTail'   ? (parsed as SquareWithTailProps)      : {} as SquareWithTailProps;
          const lineProps    = shapeType === 'Line'             ? (parsed as LineShapeProps)            : {} as LineShapeProps;
          const connectedProps = shapeType === 'ConnectingLines'? (parsed as ConnectedLinesShapeProps)  : {} as ConnectedLinesShapeProps;

          return (
            <ShapeCard
              key={shape.id}
              mode="view"
              shapeType={shapeType}
              squareProps={squareProps}
              lineProps={lineProps}
              connectedProps={connectedProps}
              selectedCoords={shape.selectedCoords}
              width={300}
              height={300}
              onClick={() => router.push(`/superadmin/shapes/update/${shape.id}`)}
              onDelete={() => handleDelete(shape.id)}      // ← This prop makes the trash icon show
            />
          );
        })}
      </div>
    </div>
  );
}
