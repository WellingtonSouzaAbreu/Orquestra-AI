'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RightSidebar from '@/components/layout/RightSidebar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import ResizableChatContainer from '@/components/chat/ResizableChatContainer';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Task, ChatMessage, Area } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function TarefasPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAreaId) {
      loadData();
    }
  }, [selectedAreaId]);

  const loadData = () => {
    const area = db.getArea(selectedAreaId);
    setSelectedArea(area);
    const loadedTasks = db.getTasks(selectedAreaId);
    setTasks(loadedTasks);
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
        if (action.type === 'create_task') {
          handleAICreateTask(action.data);
        } else if (action.type === 'update_task') {
          handleAIUpdateTask(action.data);
        } else if (action.type === 'delete_task') {
          handleAIDeleteTask(action.data);
        }
      });
    }
  };

  const handleAICreateTask = (data: { name: string; description: string }) => {
    if (!selectedAreaId) return;

    db.createTask({
      areaId: selectedAreaId,
      name: data.name,
      description: data.description,
    });
    loadData();
  };

  const handleAIUpdateTask = (data: { name: string; newName?: string; description?: string }) => {
    const task = tasks.find(t => t.name.toLowerCase() === data.name.toLowerCase());
    if (!task) {
      console.warn(`Task "${data.name}" not found for update`);
      return;
    }

    db.updateTask(task.id, {
      name: data.newName || task.name,
      description: data.description || task.description,
    });
    loadData();
  };

  const handleAIDeleteTask = (data: { name: string }) => {
    const task = tasks.find(t => t.name.toLowerCase() === data.name.toLowerCase());
    if (!task) {
      console.warn(`Task "${data.name}" not found for deletion`);
      return;
    }

    db.deleteTask(task.id);
    loadData();
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({ name: task.name, description: task.description });
    } else {
      setEditingTask(null);
      setTaskForm({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setTaskForm({ name: '', description: '' });
  };

  const handleSaveTask = () => {
    if (!taskForm.name.trim() || !selectedAreaId) return;

    if (editingTask) {
      db.updateTask(editingTask.id, {
        name: taskForm.name,
        description: taskForm.description,
      });
    } else {
      db.createTask({
        areaId: selectedAreaId,
        name: taskForm.name,
        description: taskForm.description,
      });
    }

    loadData();
    handleCloseModal();
  };

  const handleDeleteTask = (id: string) => {
    db.deleteTask(id);
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
      <ResizableChatContainer
        content={
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarefas</h1>
                  {selectedArea && (
                    <p className="text-gray-600">
                      Tarefas para: <span className="font-medium text-primary-700">{selectedArea.name}</span>
                    </p>
                  )}
                </div>
                {selectedAreaId && (
                  <button onClick={() => handleOpenModal()} className="btn-primary">
                    Adicionar Tarefa
                  </button>
                )}
              </div>

              {!selectedAreaId ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                  <p className="text-primary-900">
                    Selecione uma área na barra lateral direita para ver suas tarefas.
                  </p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                  <p className="text-primary-900">
                    Nenhuma tarefa cadastrada para esta área. Use o chat abaixo ou clique em "Adicionar Tarefa".
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 mb-8">
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      title={task.name}
                      description={task.description}
                      onEdit={() => handleOpenModal(task)}
                      onDelete={() => setDeleteConfirm(task.id)}
                    />
                  ))}
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
                context={{ type: 'task', areaId: selectedAreaId, currentPage: 'tarefas' }}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Tarefa
            </label>
            <input
              type="text"
              value={taskForm.name}
              onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
              className="input w-full"
              placeholder="Ex: Criar campanha de email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input w-full"
              rows={4}
              placeholder="Descreva esta tarefa..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCloseModal} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleSaveTask}
              disabled={!taskForm.name.trim()}
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
        onConfirm={() => deleteConfirm && handleDeleteTask(deleteConfirm)}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
    </AppLayout>
  );
}
