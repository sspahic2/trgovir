'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ShapeCanvas from "@/components/shape/ShapeCanvas";
import PrettySelect from "@/components/common/select/PrettySelect";

import { useShapeConfiguration } from "@/hooks/useShapeConfiguration";
import ShapeSidebar from "@/components/shape/ShapeSidebar";

export default function ShapeCreatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    shapeType,
    setShapeTypeSafe,
    squareProps,
    lineProps,
    connectedProps,
    currentProps,
    update,
    updateTail,
    handleSave,
    selectedCoords,
    toggleCoordinate,
  } = useShapeConfiguration();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated" || !session?.user?.isSuperAdmin) return null;

  // gather all numeric props for sliders/inputs
  const numericFields = Object.entries(currentProps).filter(
    ([_, value]) => typeof value === "number"
  );

  return (
    <div className="flex h-screen">
      {/* Shape type selector */}
      <div className="absolute top-7 left-4 z-10 w-60">
        <PrettySelect
          label="Shape Type"
          value={shapeType}
          onChange={(e) => setShapeTypeSafe(e.target.value)}
          options={[
            { value: "SquareWithTail", label: "Square with Tail" },
            { value: "Line", label: "Line" },
            { value: "ConnectingLines", label: "Connecting Lines" },
          ]}
        />
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex justify-center items-center relative" style={{ backgroundColor: 'var(--card-bg)' }}>
        <ShapeCanvas
          shapeType={shapeType}
          squareProps={squareProps}
          lineProps={lineProps}
          connectedProps={connectedProps}
          selectedCoords={selectedCoords}
          onToggleCoord={toggleCoordinate}
          mode={'edit'}
        />
      </div>

      {/* Sidebar with property controls */}
      <ShapeSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        shapeType={shapeType}
        numericFields={numericFields}
        tailConfig={squareProps.tail}
        update={update}
        updateTail={updateTail}
        onSave={handleSave}
      />
    </div>
  );
}
