'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import { ChatMessage } from '@/lib/types';
import { db } from '@/lib/storage/localStorage';
import { generateId, getCurrentTimestamp } from '@/lib/storage/database';

export default function ConversarPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState({
    areas: 0,
    kpis: 0,
    tasks: 0,
    processes: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const areas = db.getAreas();
    const kpis = db.getKPIs();
    const tasks = db.getTasks();
    const processes = db.getProcesses();

    setStats({
      areas: areas.length,
      kpis: kpis.length,
      tasks: tasks.length,
      processes: processes.length,
    });
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
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar o histórico de conversas?')) {
      setMessages([]);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversar</h1>
                <p className="text-gray-600">
                  Converse sobre todos os aspectos da sua organização.
                </p>
              </div>
              {messages.length > 0 && (
                <button onClick={handleClearHistory} className="btn-secondary text-sm">
                  Limpar Histórico
                </button>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-700">{stats.areas}</div>
                <div className="text-sm text-gray-600">Áreas</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-700">{stats.kpis}</div>
                <div className="text-sm text-gray-600">KPIs</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-700">{stats.tasks}</div>
                <div className="text-sm text-gray-600">Tarefas</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-700">{stats.processes}</div>
                <div className="text-sm text-gray-600">Processos</div>
              </div>
            </div>

            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-primary-900 mb-3">
                  Bem-vindo ao Chat Geral!
                </h2>
                <p className="text-primary-800 mb-4">
                  Aqui você pode fazer perguntas sobre qualquer aspecto da sua organização.
                  O assistente tem acesso a todas as informações cadastradas.
                </p>
                <div className="text-sm text-primary-700">
                  <p className="mb-2 font-medium">Exemplos de perguntas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quais são os principais pilares da organização?</li>
                    <li>Liste todos os KPIs da área de Marketing</li>
                    <li>Existem tarefas sem KPIs relacionados?</li>
                    <li>Mostre um resumo dos processos de cada área</li>
                    <li>Quais áreas precisam de mais atenção?</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="mb-8">
              <ChatMessages messages={messages} />
            </div>
          </div>
        </div>

        <ChatInput
          context={{ type: 'general', currentPage: 'conversar' }}
          onMessageSent={handleMessageSent}
        />
      </div>
    </AppLayout>
  );
}
