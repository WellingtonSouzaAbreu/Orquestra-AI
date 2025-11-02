'use client';

import { ReactNode } from 'react';

interface CardProps {
  title: string;
  description: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
}

export default function Card({ title, description, onEdit, onDelete, children }: CardProps) {
  return (
    <div className="card group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
