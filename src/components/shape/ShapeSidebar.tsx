// src/components/shape/ShapeSidebar.tsx
'use client';

import React from 'react';
import PrettySidebar from '@/components/common/sidebar/PrettySidebar';
import PrettyButton from '@/components/common/button/PrettyButton';
import type { TailConfig } from './SquareWithTail';
import { ShapeType } from '@/models/ShapeConfiguration';
import { useRouter } from 'next/navigation';

export interface ShapeSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  shapeType: ShapeType;
  /** [propName, value] pairs for generic numeric sliders/inputs */
  numericFields: [string, number | string | TailConfig][];
  /** only for SquareWithTail */
  tailConfig?: TailConfig;
  /** generic prop updater */
  update: (key: string, value: number) => void;
  /** tail-specific updater */
  updateTail: (key: keyof TailConfig, value: number) => void;
  /** call when user clicks “Save” */
  onSave: () => void;
  /** override default button text */
  saveLabel?: string;
}

export default function ShapeSidebar({
  isOpen,
  onToggle,
  shapeType,
  numericFields,
  tailConfig,
  update,
  updateTail,
  onSave,
  saveLabel = 'Save',
}: ShapeSidebarProps) {

  const router = useRouter();

  return (
    <PrettySidebar isOpen={isOpen} onToggle={onToggle}>
      <h2 className="text-xl font-bold mb-4">Edit Shape</h2>

      {numericFields.map(([label, value]) => {
  if (typeof value !== 'number') return null;

  return (
    <div key={label} className="mb-4">
      <label className="block mb-1 font-semibold text-sm">{label}</label>

      <input
        type="range"
        min={0}
        max={200}
        step={1}
        value={value}
        onChange={(e) => update(label, parseFloat(e.target.value))}
        className="w-full mb-1"
      />

      <input
        type="number"
        value={value}
        onChange={(e) => update(label, parseFloat(e.target.value))}
        className="w-full border rounded px-2 py-1 text-black"
      />
    </div>
  );
})}

      {shapeType === 'SquareWithTail' && tailConfig && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Tail Config</h3>
          <div className="mb-2">
            <label className="block mb-1">Corner</label>
            <select
              value={tailConfig.corner}
              onChange={e => updateTail('corner', e.target.value as any)}
              className="w-full border rounded p-1"
            >
              <option value="top-left">top-left</option>
              <option value="top-right">top-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="bottom-right">bottom-right</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1">Side</label>
            <select
              value={tailConfig.side}
              onChange={e => updateTail('side', e.target.value as any)}
              className="w-full border rounded p-1"
            >
              <option value="top">top</option>
              <option value="right">right</option>
              <option value="bottom">bottom</option>
              <option value="left">left</option>
            </select>
          </div>
          {(['length', 'angle'] as (keyof TailConfig)[]).map(key => (
            <div key={key} className="mb-4">
              <label className="block mb-1 capitalize">{key}</label>
              <input
                type="number"
                value={(tailConfig as any)[key] ?? 0}
                onChange={e => updateTail(key, parseFloat(e.target.value))}
                className="w-full border rounded p-1 mb-1"
              />
              <input
                type="range"
                min={-180}
                max={180}
                value={(tailConfig as any)[key] ?? 0}
                onChange={e => updateTail(key, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
      <PrettyButton
        color="blue"
        onClick={async () => {
          await onSave();
          router.push('/superadmin/shapes');
        }}
      >
        {saveLabel}
      </PrettyButton>
      </div>
    </PrettySidebar>
  );
}
