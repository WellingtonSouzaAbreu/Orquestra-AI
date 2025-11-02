'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ResizableChatContainer from '@/components/chat/ResizableChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Area, ChatMessage } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [areaForm, setAreaForm] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedAreas = db.getAreas();
    setAreas(loadedAreas);
  };

  const handleMessageSent = (
    userMessage: string,
    aiResponse: string,
    actions?: Array<{ type: string; data: any }>
  ) => {
    const newMessages: ChatMessage[] = [
      {
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: getCurrentTimestamp(),
      },
      {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: getCurrentTimestamp(),
      },
    ];

    setMessages((prev) => [...prev, ...newMessages]);

    // Handle AI actions to update the UI
    if (actions && actions.length > 0) {
      actions.forEach((action) => {
        if (action.type === 'create_area') {
          handleAICreateArea(action.data);
        } else if (action.type === 'update_area') {
          handleAIUpdateArea(action.data);
        } else if (action.type === 'delete_area') {
          handleAIDeleteArea(action.data);
        }
      });
    }
  };

  const handleAICreateArea = (data: { name: string; description: string }) => {
    db.createArea({
      name: data.name,
      description: data.description,
    });
    loadData();
  };

  const handleAIUpdateArea = (data: { name: string; newName?: string; description?: string }) => {
    const area = areas.find(a => a.name.toLowerCase() === data.name.toLowerCase());
    if (!area) {
      console.warn(`Area "${data.name}" not found for update`);
      return;
    }

    db.updateArea(area.id, {
      name: data.newName || area.name,
      description: data.description || area.description,
    });
    loadData();
  };

  const handleAIDeleteArea = (data: { name: string }) => {
    const area = areas.find(a => a.name.toLowerCase() === data.name.toLowerCase());
    if (!area) {
      console.warn(`Area "${data.name}" not found for deletion`);
      return;
    }

    db.deleteArea(area.id);
    loadData();
  };

  const handleOpenModal = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setAreaForm({ name: area.name, description: area.description });
    } else {
      setEditingArea(null);
      setAreaForm({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setAreaForm({ name: '', description: '' });
  };

  const handleSaveArea = () => {
    if (!areaForm.name.trim()) return;

    if (editingArea) {
      db.updateArea(editingArea.id, {
        name: areaForm.name,
        description: areaForm.description,
      });
    } else {
      db.createArea({
        name: areaForm.name,
        description: areaForm.description,
      });
    }

    loadData();
    handleCloseModal();
  };

  const handleDeleteArea = (id: string) => {
    db.deleteArea(id);
    loadData();
    setDeleteConfirm(null);
  };

  return (
    <AppLayout>
      <ResizableChatContainer
        content={
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Áreas</h1>
                  <p className="text-gray-600">
                    Defina as diferentes áreas de atuação da sua organização.
                  </p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary">
                  Adicionar Área
                </button>
              </div>

              {areas.length === 0 ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                  <p className="text-primary-900">
                    Nenhuma área cadastrada ainda. Use o chat abaixo para conversar com o assistente ou clique em "Adicionar Área".
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 mb-8">
                  {areas.map((area) => (
                    <Card
                      key={area.id}
                      title={area.name}
                      description={area.description}
                      onEdit={() => handleOpenModal(area)}
                      onDelete={() => setDeleteConfirm(area.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        chat={
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  💬 Conversar com o Assistente
                </h2>
                <ChatMessages messages={messages} />
              </div>
            </div>
            <ChatInput
              context={{ type: 'organization', currentPage: 'areas' }}
              onMessageSent={handleMessageSent}
            />
          </div>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingArea ? 'Editar Área' : 'Nova Área'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Área
            </label>
            <input
              type="text"
              value={areaForm.name}
              onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Marketing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={areaForm.description}
              onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva esta área..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCloseModal} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleSaveArea}
              disabled={!areaForm.name.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteArea(deleteConfirm)}
        title="Excluir Área"
        message="Tem certeza que deseja excluir esta área? Todos os KPIs, tarefas e processos associados também serão removidos."
      />
    </AppLayout>
  );
}
