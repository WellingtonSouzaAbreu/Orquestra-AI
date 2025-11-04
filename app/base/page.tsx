'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ResizableChatContainer from '@/components/chat/ResizableChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Organization, Pillar, ChatMessage } from '@/lib/types';
import {
  getOrganization,
  setOrganization,
  updateOrganization,
  getChatHistory,
  saveChatHistory,
} from '@/lib/storage/qdrant';
import { sendMessage } from '@/lib/ai/gemini';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function BasePage() {
  const [organization, setOrganizationState] = useState<Organization | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
  const [pillarForm, setPillarForm] = useState({ name: '', description: '' });
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
    const proactiveMessage = "Olá! Vamos definir os pilares da sua organização. Sobre o que eles são?";
    try {
      const response = await sendMessage(proactiveMessage, { type: 'organization', currentPage: 'base' });
      const newAiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: getCurrentTimestamp(),
      };
      const updatedMessages = [...messages, newAiMessage];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages, 'base');
    } catch (error) {
      console.error('Error sending proactive message:', error);
    }
  };

  const loadData = async () => {
    const org = await getOrganization();
    setOrganizationState(org);
    const chatHistory = await getChatHistory('base');
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
    await saveChatHistory(updatedMessages, 'base');

    // Handle AI actions to update the UI
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.type === 'create_pillar') {
          await handleAICreatePillar(action.data);
        } else if (action.type === 'update_pillar') {
          await handleAIUpdatePillar(action.data);
        } else if (action.type === 'delete_pillar') {
          await handleAIDeletePillar(action.data);
        }
      }
    }
  };

  const handleAICreatePillar = async (data: { name: string; description: string }) => {
    if (!organization) {
      // Create organization if it doesn't exist
      const newOrg: Organization = {
        id: generateId(),
        name: '',
        description: '',
        website: '',
        files: [],
        pillars: [{
          id: generateId(),
          name: data.name,
          description: data.description,
          createdAt: getCurrentTimestamp(),
        }],
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };
      await setOrganization(newOrg);
    } else {
      // Add pillar to existing organization
      const newPillar: Pillar = {
        id: generateId(),
        name: data.name,
        description: data.description,
        createdAt: getCurrentTimestamp(),
      };
      const pillars = organization.pillars || [];
      await updateOrganization({ pillars: [...pillars, newPillar] });
    }
    await loadData();
  };

  const handleAIUpdatePillar = async (data: { name: string; newName?: string; description?: string }) => {
    if (!organization) return;

    const pillars = organization.pillars || [];
    const pillarIndex = pillars.findIndex(p => p.name.toLowerCase() === data.name.toLowerCase());

    if (pillarIndex === -1) {
      console.warn(`Pillar "${data.name}" not found for update`);
      return;
    }

    const updatedPillars = [...pillars];
    updatedPillars[pillarIndex] = {
      ...updatedPillars[pillarIndex],
      name: data.newName || updatedPillars[pillarIndex].name,
      description: data.description || updatedPillars[pillarIndex].description,
    };

    await updateOrganization({ pillars: updatedPillars });
    await loadData();
  };

  const handleAIDeletePillar = async (data: { name: string }) => {
    if (!organization) return;

    const pillars = organization.pillars || [];
    const filteredPillars = pillars.filter(p => p.name.toLowerCase() !== data.name.toLowerCase());

    await updateOrganization({ pillars: filteredPillars });
    await loadData();
  };

  const handleOpenModal = (pillar?: Pillar) => {
    if (pillar) {
      setEditingPillar(pillar);
      setPillarForm({ name: pillar.name, description: pillar.description });
    } else {
      setEditingPillar(null);
      setPillarForm({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPillar(null);
    setPillarForm({ name: '', description: '' });
  };

  const handleSavePillar = async () => {
    if (!organization || !pillarForm.name.trim()) return;

    const pillars = organization.pillars || [];

    if (editingPillar) {
      // Update existing pillar
      const updated = pillars.map((p) =>
        p.id === editingPillar.id
          ? { ...p, name: pillarForm.name, description: pillarForm.description }
          : p
      );
      await updateOrganization({ pillars: updated });
    } else {
      // Create new pillar
      const newPillar: Pillar = {
        id: generateId(),
        name: pillarForm.name,
        description: pillarForm.description,
        createdAt: getCurrentTimestamp(),
      };
      await updateOrganization({ pillars: [...pillars, newPillar] });
    }

    await loadData();
    handleCloseModal();
  };

  const handleDeletePillar = async (id: string) => {
    if (!organization) return;
    const pillars = organization.pillars || [];
    await updateOrganization({ pillars: pillars.filter((p) => p.id !== id) });
    await loadData();
    setDeleteConfirm(null);
  };

  const pillars = organization?.pillars || [];

  return (
    <AppLayout>
      <ResizableChatContainer
        content={
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Base</h1>
                  <p className="text-gray-600">
                    Defina os pilares fundamentais da sua organização.
                  </p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary">
                  Adicionar Pilar
                </button>
              </div>

              {pillars.length === 0 ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                  <p className="text-primary-900">
                    Nenhum pilar definido ainda. Use o chat abaixo para conversar com o assistente ou clique em "Adicionar Pilar".
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 mb-8">
                  {pillars.map((pillar) => (
                    <Card
                      key={pillar.id}
                      title={pillar.name}
                      description={pillar.description}
                      onEdit={() => handleOpenModal(pillar)}
                      onDelete={() => setDeleteConfirm(pillar.id)}
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
              context={{ type: 'organization', currentPage: 'base' }}
              onMessageSent={handleMessageSent}
            />
          </div>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPillar ? 'Editar Pilar' : 'Novo Pilar'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Pilar
            </label>
            <input
              type="text"
              value={pillarForm.name}
              onChange={(e) => setPillarForm({ ...pillarForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Inovação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={pillarForm.description}
              onChange={(e) => setPillarForm({ ...pillarForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva este pilar..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCloseModal} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleSavePillar}
              disabled={!pillarForm.name.trim()}
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
        onConfirm={() => deleteConfirm && handleDeletePillar(deleteConfirm)}
        title="Excluir Pilar"
        message="Tem certeza que deseja excluir este pilar? Esta ação não pode ser desfeita."
      />
    </AppLayout>
  );
}
