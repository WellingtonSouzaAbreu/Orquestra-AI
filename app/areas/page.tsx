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
import {
  getAreas,
  getChatHistory,
  saveChatHistory,
  createArea,
  updateArea,
  deleteArea,
} from '@/lib/storage/qdrant';
import { sendMessage } from '@/lib/ai/gemini';
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

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      sendProactiveMessage();
    }
  }, [messages]);

  const sendProactiveMessage = async () => {
    const proactiveMessage = "Olá! Vamos gerenciar as áreas da sua organização. Qual área você gostaria de adicionar ou modificar?";
    try {
      const response = await sendMessage(proactiveMessage, { type: 'organization', currentPage: 'areas' });
      const newAiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: getCurrentTimestamp(),
      };
      const updatedMessages = [...messages, newAiMessage];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages, 'areas');
    } catch (error) {
      console.error('Error sending proactive message:', error);
    }
  };

  const loadData = async () => {
    const loadedAreas = await getAreas();
    setAreas(loadedAreas);
    const chatHistory = await getChatHistory('areas');
    setMessages(chatHistory);
  };

  const handleMessageSent = async (
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

    const updatedMessages = [...messages, ...newMessages];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages, 'areas');

    // Handle AI actions to update the UI
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.type === 'create_area') {
          await handleAICreateArea(action.data);
        } else if (action.type === 'update_area') {
          await handleAIUpdateArea(action.data);
        } else if (action.type === 'delete_area') {
          await handleAIDeleteArea(action.data);
        }
      }
    }
  };

  const handleAICreateArea = async (data: { name: string; description: string }) => {
    await createArea({
      name: data.name,
      description: data.description,
    });
    await loadData();
  };

  const handleAIUpdateArea = async (data: { name: string; newName?: string; description?: string }) => {
    const area = areas.find(a => a.name.toLowerCase() === data.name.toLowerCase());
    if (!area) {
      console.warn(`Area "${data.name}" not found for update`);
      return;
    }

    await updateArea(area.id, {
      name: data.newName || area.name,
      description: data.description || area.description,
    });
    await loadData();
  };

  const handleAIDeleteArea = async (data: { name: string }) => {
    const area = areas.find(a => a.name.toLowerCase() === data.name.toLowerCase());
    if (!area) {
      console.warn(`Area "${data.name}" not found for deletion`);
      return;
    }

    await deleteArea(area.id);
    await loadData();
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

  const handleSaveArea = async () => {
    if (!areaForm.name.trim()) return;

    if (editingArea) {
      await updateArea(editingArea.id, {
        name: areaForm.name,
        description: areaForm.description,
      });
    } else {
      await createArea({
        name: areaForm.name,
        description: areaForm.description,
      });
    }

    await loadData();
    handleCloseModal();
  };

  const handleDeleteArea = async (id: string) => {
    await deleteArea(id);
    await loadData();
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
