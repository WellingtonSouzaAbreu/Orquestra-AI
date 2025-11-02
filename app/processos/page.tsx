'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RightSidebar from '@/components/layout/RightSidebar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Process, ChatMessage, Area } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';
import { cn } from '@/lib/utils';

const DEFAULT_STAGES = ['planning', 'execution', 'delivery'];

export default function ProcessosPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [stages, setStages] = useState<string[]>(DEFAULT_STAGES);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [processForm, setProcessForm] = useState({ name: '', description: '', stage: 'planning' });
  const [newStageName, setNewStageName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAreaId) {
      loadData();
    }
  }, [selectedAreaId]);

  const loadData = () => {
    const area = db.getArea(selectedAreaId);
    setSelectedArea(area);
    const loadedProcesses = db.getProcesses(selectedAreaId);
    setProcesses(loadedProcesses);

    // Extract custom stages
    const customStages = new Set(DEFAULT_STAGES);
    loadedProcesses.forEach((p) => {
      if (!DEFAULT_STAGES.includes(p.stage)) {
        customStages.add(p.stage);
      }
    });
    setStages(Array.from(customStages));
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

  const handleOpenModal = (process?: Process, defaultStage?: string) => {
    if (process) {
      setEditingProcess(process);
      setProcessForm({
        name: process.name,
        description: process.description,
        stage: process.stage,
      });
    } else {
      setEditingProcess(null);
      setProcessForm({
        name: '',
        description: '',
        stage: defaultStage || 'planning',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
    setProcessForm({ name: '', description: '', stage: 'planning' });
  };

  const handleSaveProcess = () => {
    if (!processForm.name.trim() || !selectedAreaId) return;

    if (editingProcess) {
      db.updateProcess(editingProcess.id, {
        name: processForm.name,
        description: processForm.description,
        stage: processForm.stage,
      });
    } else {
      const stageProcesses = processes.filter((p) => p.stage === processForm.stage);
      db.createProcess({
        areaId: selectedAreaId,
        name: processForm.name,
        description: processForm.description,
        stage: processForm.stage,
        position: stageProcesses.length,
        connections: [],
      });
    }

    loadData();
    handleCloseModal();
  };

  const handleDeleteProcess = (id: string) => {
    db.deleteProcess(id);
    loadData();
    setDeleteConfirm(null);
  };

  const handleAddStage = () => {
    if (newStageName.trim() && !stages.includes(newStageName.trim())) {
      setStages([...stages, newStageName.trim()]);
      setNewStageName('');
      setIsStageModalOpen(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      planning: 'Planejamento',
      execution: 'Execução',
      delivery: 'Entrega',
    };
    return labels[stage] || stage;
  };

  const getProcessesByStage = (stage: string) => {
    return processes.filter((p) => p.stage === stage);
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Processos</h1>
                {selectedArea && (
                  <p className="text-gray-600">
                    Mapeamento de processos para: <span className="font-medium text-primary-700">{selectedArea.name}</span>
                  </p>
                )}
              </div>
              {selectedAreaId && (
                <div className="flex gap-2">
                  <button onClick={() => setIsStageModalOpen(true)} className="btn-secondary">
                    Adicionar Coluna
                  </button>
                  <button onClick={() => handleOpenModal()} className="btn-primary">
                    Adicionar Atividade
                  </button>
                </div>
              )}
            </div>

            {!selectedAreaId ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <p className="text-primary-900">
                  Selecione uma área na barra lateral direita para ver seus processos.
                </p>
              </div>
            ) : (
              <>
                {/* Process Board */}
                <div className="mb-8 overflow-x-auto">
                  <div className="flex gap-4 min-w-max pb-4">
                    {stages.map((stage) => {
                      const stageProcesses = getProcessesByStage(stage);
                      return (
                        <div key={stage} className="w-80 flex-shrink-0">
                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-semibold text-gray-900 uppercase text-sm">
                                {getStageLabel(stage)}
                              </h3>
                              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {stageProcesses.length}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {stageProcesses.map((process) => (
                                <div
                                  key={process.id}
                                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900 flex-1">
                                      {process.name}
                                    </h4>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleOpenModal(process)}
                                        className="text-primary-600 hover:text-primary-700 text-xs"
                                      >
                                        ✎
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(process.id)}
                                        className="text-red-600 hover:text-red-700 text-xs"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {process.description}
                                  </p>
                                </div>
                              ))}

                              <button
                                onClick={() => handleOpenModal(undefined, stage)}
                                className="w-full py-2 text-sm text-gray-500 hover:text-primary-700 hover:bg-white rounded-lg transition-colors"
                              >
                                + Adicionar atividade
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Conversar com o Assistente
                  </h2>
                  <ChatMessages messages={messages} />
                </div>
              </>
            )}
          </div>
        </div>

        {selectedAreaId && (
          <ChatInput
            context={{ type: 'process', areaId: selectedAreaId, currentPage: 'processos' }}
            onMessageSent={handleMessageSent}
          />
        )}
      </div>

      {/* Process Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProcess ? 'Editar Atividade' : 'Nova Atividade'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Atividade
            </label>
            <input
              type="text"
              value={processForm.name}
              onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Análise de requisitos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={processForm.description}
              onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva esta atividade..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etapa
            </label>
            <select
              value={processForm.stage}
              onChange={(e) => setProcessForm({ ...processForm, stage: e.target.value })}
              className="input w-full"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {getStageLabel(stage)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCloseModal} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleSaveProcess}
              disabled={!processForm.name.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Stage Modal */}
      <Modal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        title="Adicionar Nova Coluna"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Coluna
            </label>
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="input w-full"
              placeholder="Ex: Revisão"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsStageModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleAddStage}
              disabled={!newStageName.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteProcess(deleteConfirm)}
        title="Excluir Atividade"
        message="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita."
      />
    </AppLayout>
  );
}
