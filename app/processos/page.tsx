'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AppLayout from '@/components/layout/AppLayout';
import RightSidebar from '@/components/layout/RightSidebar';
import ResizableChatContainer from '@/components/chat/ResizableChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Process, ChatMessage, Area } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

const DEFAULT_STAGES = ['planning', 'execution', 'delivery'];

// Sortable Card Component
function SortableCard({
  process,
  onEdit,
  onDelete,
}: {
  process: Process;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: process.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 flex-1">{process.name}</h4>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-primary-600 hover:text-primary-700 text-xs"
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-700 text-xs"
            >
              ×
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{process.description}</p>
      </div>
    </div>
  );
}

// Sortable Column Component
function SortableColumn({
  stage,
  processes,
  getStageLabel,
  onAddActivity,
  onEditProcess,
  onDeleteProcess,
  onDeleteColumn,
  isDefault,
}: {
  stage: string;
  processes: Process[];
  getStageLabel: (stage: string) => string;
  onAddActivity: (stage: string) => void;
  onEditProcess: (process: Process) => void;
  onDeleteProcess: (id: string) => void;
  onDeleteColumn: (stage: string) => void;
  isDefault: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: stage,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-80 flex-shrink-0">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4" {...attributes} {...listeners}>
          <h3 className="font-semibold text-gray-900 uppercase text-sm cursor-grab active:cursor-grabbing">
            {getStageLabel(stage)}
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {processes.length}
            </span>
            {!isDefault && (
              <button
                onClick={() => onDeleteColumn(stage)}
                className="text-red-600 hover:text-red-700 text-sm"
                title="Deletar coluna"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <SortableContext items={processes.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {processes.map((process) => (
              <SortableCard
                key={process.id}
                process={process}
                onEdit={() => onEditProcess(process)}
                onDelete={() => onDeleteProcess(process.id)}
              />
            ))}

            <button
              onClick={() => onAddActivity(stage)}
              className="w-full py-2 text-sm text-gray-500 hover:text-primary-700 hover:bg-white rounded-lg transition-colors"
            >
              + Adicionar atividade
            </button>
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

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
  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
        if (action.type === 'create_process') {
          handleAICreateProcess(action.data);
        } else if (action.type === 'update_process') {
          handleAIUpdateProcess(action.data);
        } else if (action.type === 'delete_process') {
          handleAIDeleteProcess(action.data);
        }
      });
    }
  };

  const handleAICreateProcess = (data: { name: string; description: string; stage: string }) => {
    if (!selectedAreaId) return;

    const stageProcesses = processes.filter((p) => p.stage === data.stage);
    db.createProcess({
      areaId: selectedAreaId,
      name: data.name,
      description: data.description,
      stage: data.stage,
      position: stageProcesses.length,
      connections: [],
    });
    loadData();
  };

  const handleAIUpdateProcess = (data: { name: string; newName?: string; description?: string; stage?: string }) => {
    const process = processes.find((p) => p.name.toLowerCase() === data.name.toLowerCase());
    if (!process) {
      console.warn(`Process "${data.name}" not found for update`);
      return;
    }

    db.updateProcess(process.id, {
      name: data.newName || process.name,
      description: data.description || process.description,
      stage: data.stage || process.stage,
    });
    loadData();
  };

  const handleAIDeleteProcess = (data: { name: string }) => {
    const process = processes.find((p) => p.name.toLowerCase() === data.name.toLowerCase());
    if (!process) {
      console.warn(`Process "${data.name}" not found for deletion`);
      return;
    }

    db.deleteProcess(process.id);
    loadData();
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

  const handleDeleteColumn = (stage: string) => {
    // Delete all processes in this stage
    const stageProcesses = processes.filter((p) => p.stage === stage);
    stageProcesses.forEach((p) => db.deleteProcess(p.id));

    // Remove stage from list
    setStages(stages.filter((s) => s !== stage));
    loadData();
    setDeleteColumnConfirm(null);
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
    return processes.filter((p) => p.stage === stage).sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a card
    const activeProcess = processes.find((p) => p.id === activeId);
    if (!activeProcess) return;

    // Check if over is a stage or a card
    const overProcess = processes.find((p) => p.id === overId);
    const overStage = stages.includes(overId) ? overId : overProcess?.stage;

    if (!overStage) return;

    // If the card is being moved to a different stage
    if (activeProcess.stage !== overStage) {
      db.updateProcess(activeProcess.id, { stage: overStage });
      loadData();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (stages.includes(activeId) && stages.includes(overId)) {
      const oldIndex = stages.indexOf(activeId);
      const newIndex = stages.indexOf(overId);
      setStages(arrayMove(stages, oldIndex, newIndex));
      return;
    }

    // Handle card reordering within the same stage
    const activeProcess = processes.find((p) => p.id === activeId);
    const overProcess = processes.find((p) => p.id === overId);

    if (activeProcess && overProcess && activeProcess.stage === overProcess.stage) {
      const stageProcesses = getProcessesByStage(activeProcess.stage);
      const oldIndex = stageProcesses.findIndex((p) => p.id === activeId);
      const newIndex = stageProcesses.findIndex((p) => p.id === overId);

      const reordered = arrayMove(stageProcesses, oldIndex, newIndex);
      reordered.forEach((p, index) => {
        db.updateProcess(p.id, { position: index });
      });

      loadData();
    }
  };

  return (
    <AppLayout
      rightSidebar={
        <RightSidebar selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} />
      }
    >
      <ResizableChatContainer
        content={
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Processos</h1>
                  {selectedArea && (
                    <p className="text-gray-600">
                      Mapeamento de processos para:{' '}
                      <span className="font-medium text-primary-700">{selectedArea.name}</span>
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
                <div className="mb-8 overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={stages} strategy={horizontalListSortingStrategy}>
                      <div className="flex gap-4 min-w-max pb-4">
                        {stages.map((stage) => {
                          const stageProcesses = getProcessesByStage(stage);
                          return (
                            <SortableColumn
                              key={stage}
                              stage={stage}
                              processes={stageProcesses}
                              getStageLabel={getStageLabel}
                              onAddActivity={(s) => handleOpenModal(undefined, s)}
                              onEditProcess={handleOpenModal}
                              onDeleteProcess={setDeleteConfirm}
                              onDeleteColumn={(s) => setDeleteColumnConfirm(s)}
                              isDefault={DEFAULT_STAGES.includes(stage)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && processes.find((p) => p.id === activeId) ? (
                        <div className="bg-white rounded-lg p-4 shadow-lg opacity-90 w-80">
                          <h4 className="font-medium text-gray-900">
                            {processes.find((p) => p.id === activeId)?.name}
                          </h4>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        }
        chat={
          selectedAreaId ? (
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
                context={{ type: 'process', areaId: selectedAreaId, currentPage: 'processos' }}
                onMessageSent={handleMessageSent}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Selecione uma área para começar a conversar</p>
            </div>
          )
        }
      />

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={processForm.description}
              onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva esta atividade..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etapa</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Coluna</label>
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

      <ConfirmDialog
        isOpen={deleteColumnConfirm !== null}
        onClose={() => setDeleteColumnConfirm(null)}
        onConfirm={() => deleteColumnConfirm && handleDeleteColumn(deleteColumnConfirm)}
        title="Excluir Coluna"
        message="Tem certeza que deseja excluir esta coluna? Todas as atividades nesta coluna serão deletadas. Esta ação não pode ser desfeita."
      />
    </AppLayout>
  );
}
