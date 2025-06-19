'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ShapeCanvas from "@/components/shape/ShapeCanvas";
import PrettySelect from "@/components/common/select/PrettySelect";
import ShapeSidebar from "@/components/shape/ShapeSidebar";

import { useShapeConfiguration } from "@/hooks/useShapeConfiguration";
import { serializeConnectedLinesConfig, serializeLineConfig, serializeSquareConfig, serializeSquareWithIndependentTailsConfig, serializeSquareWithMissingSideConfig, serializeSquareWithTwoTailConfig, serializeSquareWithTwoTailDoubleConfig } from "@/lib/serializer/serializeShapeConfig";
import { defaultConfig as connectingDefaults } from "@/components/shape/ConnectingLines";
import { defaultConfig as lineDefaults } from "@/components/shape/Line";
import { defaultConfig as squareWithTailDefaults } from "@/components/shape/SquareWithTail";
import { defaultConfig as squareWithTwoTailDefaults } from "@/components/shape/SquareWithTwoTail";
import { defaultConfig as squareWithTwoTailDoubleDefaults } from "@/components/shape/SquareWithTwoTailDouble";
import { defaultConfig as squareWithMissingSideDefaults } from "@/components/shape/SquareWithMissingSide";
import { defaultConfig as independentTailDefaults } from "@/components/shape/SquareWithIndependentTails";

export default function ShapeCreatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    configuration,
    innerCoords,
    outerCoords,
    updateConfiguration,
    toggleCoordinate,
    handleSave,
    title,
    setTitle
  } = useShapeConfiguration();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated" || !session?.user?.isSuperAdmin) return null;

  return (
    <div className="flex h-screen">
      {/* Shape type selector */}
      <div className="absolute top-7 left-4 z-10 w-60">
        <PrettySelect
          label="Shape Type"
          value={configuration}
          onChange={(e) => updateConfiguration(e.target.value)}
          options={[
            {
              label: "Square with Tail",
              value: serializeSquareConfig(squareWithTailDefaults),
            },
            {
              label: "Line",
              value: serializeLineConfig(lineDefaults),
            },
            {
              label: "Connecting Lines",
              value: serializeConnectedLinesConfig(connectingDefaults),
            },
            {
              label: "Square with Two Tail",
              value: serializeSquareWithTwoTailConfig(squareWithTwoTailDefaults)
            },
            {
              label: "Square with Two Tail Double",
              value: serializeSquareWithTwoTailDoubleConfig(squareWithTwoTailDoubleDefaults)
            },
            {
              label: "Square with Missing Side",
              value: serializeSquareWithMissingSideConfig(squareWithMissingSideDefaults)
            },
            {
              label: "Square – independent tails",
              value: serializeSquareWithIndependentTailsConfig(independentTailDefaults)
            }
          ]}
        />
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex justify-center items-center relative" style={{ backgroundColor: 'var(--card-bg)' }}>
        <ShapeCanvas
          rawConfig={configuration}
          selectedCoords={outerCoords.concat(innerCoords)}
          onToggleCoord={toggleCoordinate}
          mode={'edit'}
          width={300}
          height={300}
        />
      </div>

      {/* Sidebar with property controls */}
      <ShapeSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        configuration={configuration}
        updateConfiguration={updateConfiguration}
        onSave={handleSave}
        title={title}
        setTitle={setTitle}
      />
    </div>
  );
}