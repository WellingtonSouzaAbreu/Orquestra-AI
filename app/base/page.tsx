'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Organization, Pillar, ChatMessage } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function BasePage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
  const [pillarForm, setPillarForm] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const org = db.getOrganization();
    setOrganization(org);
  };

  const handleMessageSent = (userMessage: string, aiResponse: string) => {
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
    setTimeout(loadData, 500);
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

  const handleSavePillar = () => {
    if (!organization || !pillarForm.name.trim()) return;

    const pillars = organization.pillars || [];

    if (editingPillar) {
      // Update existing pillar
      const updated = pillars.map((p) =>
        p.id === editingPillar.id
          ? { ...p, name: pillarForm.name, description: pillarForm.description }
          : p
      );
      db.updateOrganization({ pillars: updated });
    } else {
      // Create new pillar
      const newPillar: Pillar = {
        id: generateId(),
        name: pillarForm.name,
        description: pillarForm.description,
        createdAt: getCurrentTimestamp(),
      };
      db.updateOrganization({ pillars: [...pillars, newPillar] });
    }

    loadData();
    handleCloseModal();
  };

  const handleDeletePillar = (id: string) => {
    if (!organization) return;
    const pillars = organization.pillars || [];
    db.updateOrganization({ pillars: pillars.filter((p) => p.id !== id) });
    loadData();
    setDeleteConfirm(null);
  };

  const pillars = organization?.pillars || [];

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-8">
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

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Conversar com o Assistente
              </h2>
              <ChatMessages messages={messages} />
            </div>
          </div>
        </div>

        <ChatInput
          context={{ type: 'organization', currentPage: 'base' }}
          onMessageSent={handleMessageSent}
        />
      </div>

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
