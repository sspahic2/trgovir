'use client';

import { useEffect, useState } from 'react';
import { ConfigurationService } from '@/services/configuration.service';
import type { ShapeConfiguration } from '@/models/ShapeConfiguration';
import PrettySidebar from '@/components/common/sidebar/PrettySidebar';
import ShapeCard from '@/components/shape/ShapeCard';
import PrettyInput from '@/components/common/input/PrettyInput';

interface ShapeSearchableSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectShape: (shape: ShapeConfiguration) => void;
}

export default function ShapeSearchableSidebar({
  isOpen,
  onToggle,
  onSelectShape
}: ShapeSearchableSidebarProps) {
  const [shapes, setShapes] = useState<ShapeConfiguration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    ConfigurationService.getAll().then(setShapes);
  }, []);

  const filtered = searchQuery
    ? shapes.filter(s =>
        s.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shapes;

  return (
    <PrettySidebar
      isOpen={isOpen}
      onToggle={onToggle}
      toggleAsButton={false}
      buttonColor="red"
      className="bg-white"
      widthPercentage={80}
    >
      <h2 className="text-lg font-semibold mb-4">Izaberi oblik</h2>

      <PrettyInput
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Potraži..."
        className="mb-4"
      />

      <div className="grid grid-cols-4 gap-4">
        {filtered.map((shape) => (
          <ShapeCard
            key={shape.id}
            rawConfig={shape.configuration}
            selectedCoords={shape.selectedCoords}
            mode="view"
            onClick={() => onSelectShape(shape)}
            title={shape.title}
            height={250}
          />
        ))}
      </div>
    </PrettySidebar>
  );
}
