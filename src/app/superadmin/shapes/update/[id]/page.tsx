// src/app/superadmin/shapes/update/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import ShapeCanvas from '@/components/shape/ShapeCanvas';
import ShapeSidebar from '@/components/shape/ShapeSidebar';
import { useShapeConfiguration } from '@/hooks/useShapeConfiguration';
import { ConfigurationService } from '@/services/configuration.service';

export default function ShapeUpdatePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    configuration,
    innerCoords,
    outerCoords,
    loadConfiguration,
    updateConfiguration,
    handleUpdate,
    toggleCoordinate,
    title,
    setTitle
  } = useShapeConfiguration();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  // Load existing configuration
  useEffect(() => {
    const numericId = Number(id);
    if (isNaN(numericId)) return;

    ConfigurationService.getById(numericId)
      .then(({ configuration, selectedCoords, title }) => {
        loadConfiguration(configuration, selectedCoords, title);
      })
      .catch((err) => {
        console.error('Failed to load configuration', err);
      })
      .finally(() => setLoading(false));
  }, [id, loadConfiguration]);

  if (
    status !== 'authenticated' ||
    !session?.user?.isSuperAdmin ||
    loading
  ) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Canvas area */}
      <div className="flex-1 flex justify-center items-center relative" style={{ backgroundColor: 'var(--card-bg)' }}>
        <ShapeCanvas
          rawConfig={configuration}
          selectedCoords={outerCoords.concat(innerCoords)}
          onToggleCoord={toggleCoordinate}
          mode="edit"
          width={400}
          height={400}
        />
      </div>

      {/* Sidebar for editing */}
      <ShapeSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        configuration={configuration}
        updateConfiguration={updateConfiguration}
        onSave={() => handleUpdate(Number(id))}
        saveLabel="Save Changes"
        title={title}
        setTitle={setTitle}
      />
    </div>
  );
}
