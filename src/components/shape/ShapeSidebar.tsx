'use client';

import React from 'react';
import PrettySidebar from '@/components/common/sidebar/PrettySidebar';
import PrettyButton from '@/components/common/button/PrettyButton';
import { useRouter } from 'next/navigation';
import { parseGeneralConfig } from '@/lib/parser/parseShapeConfig';
import {
  serializeSquareConfig,
  serializeLineConfig,
  serializeConnectedLinesConfig,
  serializeSquareWithTwoTailConfig,
  serializeSquareWithMissingSideConfig,
  serializeSquareWithTwoTailDoubleConfig,
  serializeSquareWithIndependentTailsConfig,
} from '@/lib/serializer/serializeShapeConfig';
import type { TailConfig, SquareWithTailProps } from './SquareWithTail';
import type { LineShapeProps } from './Line';
import type { ConnectedLinesShapeProps } from './ConnectingLines';
import PrettyInput from '@/components/common/input/PrettyInput';
import { SquareWithTwoTailProps } from './SquareWithTwoTail';
import type { SquareWithMissingSideProps } from './SquareWithMissingSide';
import { SquareWithTwoTailDoubleProps } from './SquareWithTwoTailDouble';
import { DualTailConfig, SquareWithIndependentTailsProps } from './SquareWithIndependentTails';

type DraftTail = Partial<DualTailConfig>;

export interface ShapeSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  configuration: string;
  updateConfiguration: (newConfig: string) => void;
  onSave: () => void;
  saveLabel?: string;
  title?: string;
  setTitle: (input: string) => void;
}

export default function ShapeSidebar({
  isOpen,
  onToggle,
  configuration,
  updateConfiguration,
  onSave,
  saveLabel = 'Save',
  title,
  setTitle
}: ShapeSidebarProps) {
  const router = useRouter();
  const type = configuration.split(';')[0];
  const parsed = parseGeneralConfig(configuration);

  if (parsed === 'Invalid') return null;

  const updateProp = (key: string, value: number) => {
    if (type === "SquareWithTail") {
      const updated = { ...(parsed as SquareWithTailProps), [key]: value };
      updateConfiguration(serializeSquareConfig(updated));
    } else if (type === "Line") {
      const updated = { ...(parsed as LineShapeProps), [key]: value };
      updateConfiguration(serializeLineConfig(updated));
    } else if (type === "ConnectingLines") {
      const updated = { ...(parsed as ConnectedLinesShapeProps), [key]: value };
      updateConfiguration(serializeConnectedLinesConfig(updated));
    } else if (type === "SquareWithTwoTail") {
      const updated = { ...(parsed as SquareWithTwoTailProps), [key]: value };
      updateConfiguration(serializeSquareWithTwoTailConfig(updated));
    } else if (type === "SquareWithMissingSide") {
      const updated = { ...(parsed as SquareWithMissingSideProps), [key]: value };
      updateConfiguration(serializeSquareWithMissingSideConfig(updated));
    } else if(type === "SquareWithTwoTailDouble") {
      const update = { ...(parsed as SquareWithTwoTailDoubleProps), [key]: value };
      updateConfiguration(serializeSquareWithTwoTailDoubleConfig(update));
    } else if (type === "SquareWithIndependentTails") {
      const updated = { ...(parsed as SquareWithIndependentTailsProps), [key]: value };
      updateConfiguration(serializeSquareWithIndependentTailsConfig(updated));
    }
  };

  const updateTailProp = (key: keyof DualTailConfig, value: any, idx: 0 | 1 = 0) => {

    if (type === 'SquareWithIndependentTails') {
      const cur   = parsed as SquareWithIndependentTailsProps;
      const tails: [DraftTail?, DraftTail?] = [...(cur.tails ?? [])];

      tails[idx] = { ...(tails[idx] ?? {}), [key]: value };

      updateConfiguration(
        serializeSquareWithIndependentTailsConfig(
          { ...cur, tails: tails as [DualTailConfig?, DualTailConfig?] } // ← cast once here
        )
      );
      return;
    }

    const current = parsed as SquareWithTailProps;
    const updated = {
      ...current,
      tail: {
        ...current.tail!,
        [key]: value,
      },
    };

    if (type === "SquareWithTwoTail") {
      updateConfiguration(serializeSquareWithTwoTailConfig(updated));
    } 
    else if (type === "SquareWithTwoTailDouble") {
      updateConfiguration(serializeSquareWithTwoTailDoubleConfig(updated));
    }
    else {
      updateConfiguration(serializeSquareConfig(updated));
    }
  };

  const updateMissingSideConfig = (field: 'sides' | 'lengths', key: string, value: any) => {
    const config = parsed as SquareWithMissingSideProps;
    const updated = {
      ...config,
      [field]: {
        ...(config[field] ?? {}),
        [key]: value,
      },
    };
    updateConfiguration(serializeSquareWithMissingSideConfig(updated));
  };

  const updateIndependentSide = (
    group: "lengths" | "sides",
    side: "top" | "right" | "bottom" | "left",
    value: number | boolean,
  ) => {
    if (type !== "SquareWithIndependentTails") return;

    const config = parsed as SquareWithMissingSideProps;
    const updated = {
      ...config,
      [group]: {
        ...(config[group] ?? {}),
        [side]: value,
      },
    };

    if (type !== "SquareWithIndependentTails") updateConfiguration(serializeSquareWithMissingSideConfig(updated));

    updateConfiguration(
      serializeSquareWithIndependentTailsConfig(updated)
    );
  };

  const sideKeys = ['top', 'right', 'bottom', 'left'] as const;
  type Side = typeof sideKeys[number]; // "top" | "right" | "bottom" | "left"
  const { sides = {} } = parsed as SquareWithMissingSideProps;

  return (
    <PrettySidebar isOpen={isOpen} onToggle={onToggle}>
      <h2 className="text-xl font-bold mb-4">Edit Shape</h2>
      <PrettyInput
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Shape Title"
        className="w-full border rounded px-3 py-2 text-sm mb-4"
      />

      {/* Universal numeric fields */}
      {Object.entries(parsed).map(([key, val]) => {
        if (key === "tail" || typeof val !== "number") return null;
        return (
          <div key={key} className="mb-4">
            <label className="block mb-1 font-semibold text-sm">{key}</label>
            <input
              type="range"
              min={0}
              max={300}
              step={1}
              value={val}
              onChange={(e) => updateProp(key, parseFloat(e.target.value))}
              className="w-full mb-1"
            />
            <input
              type="number"
              value={val}
              onChange={(e) => updateProp(key, parseFloat(e.target.value))}
              className="w-full border rounded px-2 py-1 text-black"
            />
          </div>
        );
      })}

      {/* Tail Configuration */}
      {(type === "SquareWithTail" || type === "SquareWithTwoTail" || type === "SquareWithTwoTailDouble") && (parsed as SquareWithTailProps).tail && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Tail Config</h3>
          {["corner", "side"].map((key) => (
            <div key={key} className="mb-2">
              <label className="block mb-1 capitalize">{key}</label>
              <select
                value={(parsed as SquareWithTailProps).tail![key as keyof TailConfig] as string}
                onChange={(e) => updateTailProp(key as keyof TailConfig, e.target.value)}
                className="w-full border rounded p-1"
              >
                {(key === "corner"
                  ? ["top-left", "top-right", "bottom-left", "bottom-right"]
                  : ["top", "right", "bottom", "left"]
                ).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
          {["length", "angle"].map((key) => (
            <div key={key} className="mb-4">
              <label className="block mb-1 capitalize">{key}</label>
              <input
                type="number"
                value={(parsed as SquareWithTailProps).tail![key as keyof TailConfig] ?? 0}
                onChange={(e) => updateTailProp(key as keyof TailConfig, parseFloat(e.target.value))}
                className="w-full border rounded p-1 mb-1"
              />
              <input
                type="range"
                min={-180}
                max={180}
                value={(parsed as SquareWithTailProps).tail![key as keyof TailConfig] ?? 0}
                onChange={(e) => updateTailProp(key as keyof TailConfig, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {type === 'SquareWithIndependentTails' && (
        <div className="mt-6 space-y-8">

          {/* ── Per-side lengths ─────────────────────────────── */}
          <h3 className="font-semibold text-lg mb-2">Side Lengths</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["top", "right", "bottom", "left"] as const).map(side => (
              <label key={side} className="flex flex-col text-sm">
                {side}
                <input
                  type="number"
                  value={(parsed as SquareWithIndependentTailsProps).lengths?.[side] ?? ""}
                  onChange={e =>
                    updateIndependentSide(
                      "lengths",
                      side,
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="border p-1 rounded text-sm"
                />
              </label>
            ))}
          </div>

          {/* ── Side visibility ──────────────────────────────── */}
          <h3 className="font-semibold text-lg mt-6 mb-2">Side Visibility</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["top", "right", "bottom", "left"] as const).map(side => (
              <label key={side} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    (parsed as SquareWithIndependentTailsProps).sides?.[side] ?? true
                  }
                  onChange={e =>
                    updateIndependentSide("sides", side, e.target.checked)
                  }
                />
                {side}
              </label>
            ))}
          </div>

          {[0, 1].map(i => {
            const t = (parsed as SquareWithIndependentTailsProps).tails?.[i] ?? {};
            return (
              <div key={i}>
                <h3 className="font-semibold text-lg mb-2">{`Tail #${i + 1}`}</h3>

                {["corner", "side"].map(field => (
                  <div key={field} className="mb-2">
                    <label className="block mb-1 capitalize">{field}</label>
                    <select
                      value={(t as any)[field] ?? ""}
                      onChange={e =>
                        updateTailProp(field as keyof DualTailConfig, e.target.value, i as 0 | 1)
                      }
                      className="w-full border rounded p-1"
                    >
                      {(field === "corner"
                        ? ["top-left", "top-right", "bottom-left", "bottom-right"]
                        : ["top", "right", "bottom", "left"]
                      ).map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {["length", "angle"].map(field => (
                  <div key={field} className="mb-4">
                    <label className="block mb-1 capitalize">{field}</label>
                    <input
                      type="number"
                      value={(t as any)[field] ?? 0}
                      onChange={e =>
                        updateTailProp(
                          field as keyof DualTailConfig,
                          parseFloat(e.target.value),
                          i as 0 | 1,
                        )
                      }
                      className="w-full border rounded p-1 mb-1"
                    />
                    <input
                      type="range"
                      min={field === "angle" ? -180 : 0}
                      max={field === "angle" ? 180 : 300}
                      value={(t as any)[field] ?? 0}
                      onChange={e =>
                        updateTailProp(
                          field as keyof DualTailConfig,
                          parseFloat(e.target.value),
                          i as 0 | 1,
                        )
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* SquareWithMissingSide Configuration */}
      {type === "SquareWithMissingSide" && (
        <>
          <h3 className="font-semibold text-lg mt-6 mb-2">Side Visibility</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {sideKeys.map((side) => (
              <label key={side} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sides[side] ?? false}
                  onChange={(e) =>
                    updateMissingSideConfig("sides", side, e.target.checked)
                  }
                />
                {side}
              </label>
            ))}
          </div>

          <h3 className="font-semibold text-lg mb-2">Side Lengths</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <label key={side} className="flex flex-col text-sm">
                {side}
                <input
                  type="number"
                  value={(parsed as SquareWithMissingSideProps).lengths?.[side] ?? ''}
                  onChange={(e) =>
                    updateMissingSideConfig("lengths", side, parseFloat(e.target.value) || 0)
                  }
                  className="border p-1 rounded text-sm"
                />
              </label>
            ))}
          </div>
        </>
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
