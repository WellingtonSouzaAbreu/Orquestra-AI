'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RightSidebar from '@/components/layout/RightSidebar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { KPI, ChatMessage, Area } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function KPIsPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [kpiForm, setKpiForm] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAreaId) {
      loadData();
    }
  }, [selectedAreaId]);

  const loadData = () => {
    const area = db.getArea(selectedAreaId);
    setSelectedArea(area);
    const loadedKPIs = db.getKPIs(selectedAreaId);
    setKpis(loadedKPIs);
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
    if (actions && actions.length > 0 && selectedAreaId) {
      actions.forEach((action) => {
        if (action.type === 'create_kpi') {
          handleAICreateKPI(action.data);
        }
      });
    }
  };

  const handleAICreateKPI = (data: { name: string; description: string }) => {
    if (!selectedAreaId) return;

    db.createKPI({
      areaId: selectedAreaId,
      name: data.name,
      description: data.description,
    });
    loadData();
  };

  const handleOpenModal = (kpi?: KPI) => {
    if (kpi) {
      setEditingKPI(kpi);
      setKpiForm({ name: kpi.name, description: kpi.description });
    } else {
      setEditingKPI(null);
      setKpiForm({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingKPI(null);
    setKpiForm({ name: '', description: '' });
  };

  const handleSaveKPI = () => {
    if (!kpiForm.name.trim() || !selectedAreaId) return;

    if (editingKPI) {
      db.updateKPI(editingKPI.id, {
        name: kpiForm.name,
        description: kpiForm.description,
      });
    } else {
      db.createKPI({
        areaId: selectedAreaId,
        name: kpiForm.name,
        description: kpiForm.description,
      });
    }

    loadData();
    handleCloseModal();
  };

  const handleDeleteKPI = (id: string) => {
    db.deleteKPI(id);
    loadData();
    setDeleteConfirm(null);
  };

  return (
    <AppLayout
      rightSidebar={
        <RightSidebar
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
        />
      }
    >
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">KPIs</h1>
                {selectedArea && (
                  <p className="text-gray-600">
                    Indicadores de desempenho para: <span className="font-medium text-primary-700">{selectedArea.name}</span>
                  </p>
                )}
              </div>
              {selectedAreaId && (
                <button onClick={() => handleOpenModal()} className="btn-primary">
                  Adicionar KPI
                </button>
              )}
            </div>

            {!selectedAreaId ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <p className="text-primary-900">
                  Selecione uma área na barra lateral direita para ver seus KPIs.
                </p>
              </div>
            ) : kpis.length === 0 ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <p className="text-primary-900">
                  Nenhum KPI cadastrado para esta área. Use o chat abaixo ou clique em "Adicionar KPI".
                </p>
              </div>
            ) : (
              <div className="grid gap-4 mb-8">
                {kpis.map((kpi) => (
                  <Card
                    key={kpi.id}
                    title={kpi.name}
                    description={kpi.description}
                    onEdit={() => handleOpenModal(kpi)}
                    onDelete={() => setDeleteConfirm(kpi.id)}
                  />
                ))}
              </div>
            )}

            {selectedAreaId && (
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Conversar com o Assistente
                </h2>
                <ChatMessages messages={messages} />
              </div>
            )}
          </div>
        </div>

        {selectedAreaId && (
          <ChatInput
            context={{ type: 'kpi', areaId: selectedAreaId, currentPage: 'kpis' }}
            onMessageSent={handleMessageSent}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingKPI ? 'Editar KPI' : 'Novo KPI'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do KPI
            </label>
            <input
              type="text"
              value={kpiForm.name}
              onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Taxa de Conversão"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (Por que este KPI importa?)
            </label>
            <textarea
              value={kpiForm.description}
              onChange={(e) => setKpiForm({ ...kpiForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva por que este KPI é importante..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCloseModal} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleSaveKPI}
              disabled={!kpiForm.name.trim()}
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
        onConfirm={() => deleteConfirm && handleDeleteKPI(deleteConfirm)}
        title="Excluir KPI"
        message="Tem certeza que deseja excluir este KPI? Esta ação não pode ser desfeita."
      />
    </AppLayout>
  );
}
