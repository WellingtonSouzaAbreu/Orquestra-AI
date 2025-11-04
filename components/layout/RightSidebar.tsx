'use client';

import { useEffect, useState } from 'react';
import { Area } from '@/lib/types';
import { getAreas } from '@/lib/storage/qdrant';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  selectedAreaId?: string;
  onSelectArea: (areaId: string) => void;
}

export default function RightSidebar({ selectedAreaId, onSelectArea }: RightSidebarProps) {
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    loadAreas();
    // Listen for storage changes
    const handleStorage = () => loadAreas();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadAreas = async () => {
    const loadedAreas = await getAreas();
    setAreas(loadedAreas);

    // Auto-select first area if none selected
    if (!selectedAreaId && loadedAreas.length > 0) {
      onSelectArea(loadedAreas[0].id);
    }
  };

  if (areas.length === 0) {
    return (
      <aside className="w-64 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Áreas</h2>
          <p className="text-sm text-gray-500">
            Nenhuma área cadastrada. Crie áreas na seção Organização → Áreas.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-l border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Área</h2>
        <div className="space-y-2">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => onSelectArea(area.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg transition-colors duration-150',
                selectedAreaId === area.id
                  ? 'bg-primary-100 border-2 border-primary-500 text-primary-900'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
              )}
            >
              <div className="font-medium">{area.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {area.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
